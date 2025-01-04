import * as lexical from 'lexical'
import * as lexicalHeadless from '@lexical/headless'
import * as lexicalHTML from '@lexical/html'

import { defaultTheme, readOnlyTheme } from '../editors/theme.js'
import { entityConfig } from '../editors/Entity/config.js'
import { bioConfig } from '../editors/Bio/config.js'
import { SYSTEM_IDS } from '../editors/constants.js'
import { getEditor } from '../../../yjs.js'
import { base64ToUint8Array } from 'uint8array-extras'

const { $getRoot } = lexical
const { createHeadlessEditor } = lexicalHeadless
const { $generateHtmlFromNodes } = lexicalHTML

const { ENTITY, BIO, REVIEW } = SYSTEM_IDS
const configs = {
  [ENTITY]: entityConfig,
  [BIO]: bioConfig,
  [REVIEW]: bioConfig
}

const theme = { ...defaultTheme, ...readOnlyTheme }

export async function toHTML ({ content, update }, type) {
  return new Promise((resolve, reject) => {
    if (!content && !update) {
      reject(new Error('No content and/or update provided.'))

      return
    }

    const conf = configs[type] ?? bioConfig
    const config = conf(theme, false, null, (error) => {
      reject(error)
    })

    /**
     * @type {import('lexical').LexicalEditor}
     */
    let editor
    if (update) {
      const e = getEditor(config, base64ToUint8Array(update))
      editor = e.editor
    } else {
      editor = createHeadlessEditor(config)

      editor.setEditorState(editor.parseEditorState(content))
    }

    editor.read(() => {
      const textInEditor = $getRoot().getTextContent().trim()

      if (textInEditor.length > 0) {
        resolve($generateHtmlFromNodes(editor, null))
      } else {
        resolve('')
      }
    })
  })
}
