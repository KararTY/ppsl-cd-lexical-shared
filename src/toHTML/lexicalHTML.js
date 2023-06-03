import 'linkedom-global'

import lexicalHeadless from '@lexical/headless'
import lexicalHTML from '@lexical/html'

import { defaultTheme, readOnlyTheme } from '../editors/theme'
import { entityConfig } from '../editors/Entity/config'
import { bioConfig } from '../editors/Bio/config'

const { createHeadlessEditor } = lexicalHeadless
const { $generateHtmlFromNodes } = lexicalHTML

const theme = { ...defaultTheme, ...readOnlyTheme }

const configs = {
  entity: entityConfig,
  bio: bioConfig,
  review: bioConfig
}

export async function toHTML (strState, type) {
  return new Promise((resolve, reject) => {
    const conf = configs[type] ?? bioConfig
    const config = conf(theme, false, (error) => {
      reject(error)
    })

    const editor = createHeadlessEditor(config)

    editor.setEditorState(editor.parseEditorState(strState))

    editor.update(() => {
      resolve($generateHtmlFromNodes(editor, null))
    })
  })
}
