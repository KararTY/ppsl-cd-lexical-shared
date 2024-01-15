import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { $getRoot } from 'lexical'
import { createHeadlessEditor } from '@lexical/headless'
import { $generateHtmlFromNodes } from '@lexical/html'

import { bioConfig } from './config'
import { defaultTheme, readOnlyTheme } from '../theme'

export const BioHTML = forwardRef(
  ({ initialContent, className = '', handleIsEmpty }, ref) => {
    const [html, setHTML] = useState('<span>Loading...</span>')

    const callbackHandleIsEmpty = useCallback(handleIsEmpty, [handleIsEmpty])

    const memoizedInitialContent = useMemo(
      () => initialContent,
      [initialContent]
    )

    const theme = { ...defaultTheme, ...readOnlyTheme }

    const config = bioConfig(theme, false, function onError (error) {
      throw error
    })

    const editor = createHeadlessEditor(config)

    useEffect(() => {
      if (!memoizedInitialContent) {
        setHTML('')
        callbackHandleIsEmpty?.(true)
        return
      }

      editor.setEditorState(editor.parseEditorState(memoizedInitialContent))

      editor.update(() => {
        // https://github.com/facebook/lexical/issues/2308
        const textInEditor = $getRoot().getTextContent().trim()

        if (textInEditor.length > 0) {
          setHTML($generateHtmlFromNodes(editor, null))
        } else {
          setHTML('')
          callbackHandleIsEmpty?.(true)
        }
      })
    }, [editor, callbackHandleIsEmpty, memoizedInitialContent])

    return (
      html && (
        <div
          className={className}
          ref={ref}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    )
  }
)

BioHTML.displayName = 'BioHTML'
