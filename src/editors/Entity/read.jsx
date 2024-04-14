import { useEffect, useMemo, useState } from 'react'
import { createHeadlessEditor } from '@lexical/headless'
import { $generateHtmlFromNodes } from '@lexical/html'

import { entityConfig } from './config'
import { defaultTheme, readOnlyTheme } from '../theme'
import { updateToJSON } from '../../toHTML/yjs'
import { base64ToUint8Array } from 'uint8array-extras'

export function EntityHTML ({ update }) {
  const [html, setHTML] = useState('<span>Loading...</span>')

  const theme = useMemo(() => ({ ...defaultTheme, ...readOnlyTheme }), [])

  const config = useMemo(
    () =>
      entityConfig(theme, false, function onError (error) {
        throw error
      }),
    [theme]
  )

  const initialContent = useMemo(
    () => updateToJSON(config, base64ToUint8Array(update)),
    [config, update]
  )

  const editor = createHeadlessEditor(config)

  editor.setEditorState(editor.parseEditorState(initialContent))

  useEffect(() => {
    editor.update(
      () => {
        setHTML($generateHtmlFromNodes(editor, null))
      },
      { discrete: true }
    )
  }, [editor])

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
