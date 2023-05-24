/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch
} from '@lexical/react/LexicalTypeaheadMenuPlugin'

import { $createEntityMentionNode } from './node'
import { getPostsByTitle } from '@/lib/api/posts'

const PUNCTUATION =
  "\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%'\"~=<>_:;"
const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']'

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION
}

const CapitalizedNameMentionsRegex = new RegExp(
  '(^|[^#])((?:' + DocumentMentionsRegex.NAME + '{' + 1 + ',})$)'
)

const PUNC = DocumentMentionsRegex.PUNCTUATION

const TRIGGERS = ['@'].join('')

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = '[^' + TRIGGERS + PUNC + '\\s]'

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
  '(?:' +
  '\\.[ |$]|' + // E.g. "r. " in "Mr. Smith"
  ' |' + // E.g. " " in "Josh Duck"
  '[' +
  PUNC +
  ']|' + // E.g. "-' in "Salier-Hellendag"
  ')'

const LENGTH_LIMIT = 75

const AtSignMentionsRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    VALID_JOINS +
    '){0,' +
    LENGTH_LIMIT +
    '})' +
    ')$'
)

// 50 is the longest alias length limit.
const ALIAS_LENGTH_LIMIT = 50

// Regex used to match alias.
const AtSignMentionsRegexAliasRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    '){0,' +
    ALIAS_LENGTH_LIMIT +
    '})' +
    ')$'
)

// At most, 5 suggestions are shown in the popup.
const SUGGESTION_LIST_LENGTH_LIMIT = 5

const mentionsCache = new Map()

const dummyLookupService = {
  search (string, callback) {
    getPostsByTitle(string, [
      {
        outRelations: {
          some: {
            toPostId: 'entity'
          }
        }
      }
    ]).then((data) => {
      const results = []

      for (let index = 0; index < data.result.length; index++) {
        const result = data.result[index]

        const [{ title, language }] = result.postHistory || []

        results.push({
          postId: result.id,
          title,
          label: `${title} [${language}]${
            title.toLowerCase() === result.id ? ' <SYSTEM>' : ''
          }`
        })
      }

      callback(results)
    })
  }
}

/**
 * @param {string} mentionString
 */
function useMentionLookupService (mentionString) {
  const [results, setResults] = useState([])

  useEffect(() => {
    const cachedResults = mentionsCache.get(mentionString)

    if (mentionString == null) {
      setResults([])
      return
    }

    if (cachedResults === null) {
      return
    } else if (cachedResults !== undefined) {
      setResults(cachedResults)
      return
    }

    mentionsCache.set(mentionString, null)
    dummyLookupService.search(mentionString, (newResults) => {
      mentionsCache.set(mentionString, newResults)
      setResults(newResults)
    })
  }, [mentionString])

  return results
}

/**
 * @param {string} text
 * @param {number} minMatchLength
 */
function checkForCapitalizedNameMentions (text, minMatchLength) {
  const match = CapitalizedNameMentionsRegex.exec(text)
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know its
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1]

    const matchingString = match[2]
    if (matchingString != null && matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: matchingString
      }
    }
  }

  return null
}

/**
 * @param {string} text
 * @param {number} minMatchLength
 */
function checkForAtSignMentions (text, minMatchLength) {
  let match = AtSignMentionsRegex.exec(text)

  if (match === null) {
    match = AtSignMentionsRegexAliasRegex.exec(text)
  }

  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1]

    const matchingString = match[3]
    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: match[2]
      }
    }
  }

  return null
}

/**
 * @param {string} text
 */
function getPossibleQueryMatch (text) {
  const match = checkForAtSignMentions(text, 1)
  return match === null ? checkForCapitalizedNameMentions(text, 3) : match
}

class MentionTypeaheadOption {
  key = ''
  ref = null

  postId = ''
  label = ''
  title = ''

  /**
   * @param {string} title Used for displaying in document.
   * @param {string} label Used for menu display label.
   */
  constructor (postId, title, label) {
    this.key = postId
    this.ref = { current: null }
    this.setRefElement = this.setRefElement.bind(this)

    this.postId = postId
    this.label = label
    this.title = title
  }

  /**
   *
   * @param {HTMLElement | null} element
   */
  setRefElement (element) {
    this.ref = { current: element }
  }
}

/**
 * @param {{index: number,isSelected: boolean,onClick: () => void,onMouseEnter: () => void,option: MentionTypeaheadOption}} param0
 */
function MentionsTypeaheadMenuItem ({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option
}) {
  let className = 'list-none p-2 text-white'

  if (isSelected) {
    className += ' bg-blue-500 cursor-pointer rounded'
  }

  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {option.picture}
      <span className="text">{option.label}</span>
    </li>
  )
}

export function EntityMentionPlugin () {
  const [editor] = useLexicalComposerContext()

  const [queryString, setQueryString] = useState(null)

  const results = useMentionLookupService(queryString)

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0
  })

  const options = useMemo(
    () =>
      results
        .map(
          (result) =>
            new MentionTypeaheadOption(
              result.postId,
              result.title,
              result.label
            )
        )
        .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
    [results]
  )

  const onSelectOption = useCallback(
    (selectedOption, nodeToReplace, closeMenu) => {
      editor.update(() => {
        const mentionNode = $createEntityMentionNode(selectedOption)

        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode)
        }

        mentionNode.select()
        closeMenu()
      })
    },
    [editor]
  )

  const checkForMentionMatch = useCallback(
    (text) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor)
      if (slashMatch !== null) {
        return null
      }

      return getPossibleQueryMatch(text)
    },
    [checkForSlashTriggerMatch, editor]
  )

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) =>
        anchorElementRef.current && results.length > 0
          ? ReactDOM.createPortal(
              <div className="mt-6 min-w-[250px] rounded bg-gray-500 bg-opacity-50 shadow">
                <ul className="!list-none">
                  {options.map((option, i) => (
                    <MentionsTypeaheadMenuItem
                      index={i}
                      isSelected={selectedIndex === i}
                      onClick={() => {
                        setHighlightedIndex(i)
                        selectOptionAndCleanUp(option)
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(i)
                      }}
                      key={option.key}
                      option={option}
                    />
                  ))}
                </ul>
              </div>,
              anchorElementRef.current
          )
          : null
      }
    />
  )
}
