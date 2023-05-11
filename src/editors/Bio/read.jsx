import { useEffect, useState } from 'react'
import { createHeadlessEditor } from '@lexical/headless'
import { $generateHtmlFromNodes } from '@lexical/html'

import { theme } from '../theme'

export function BioHTML ({ initialContent }) {
  const [html, setHTML] = useState('<span>Loading...</span>')

  const editor = createHeadlessEditor({
    theme,
    onError: () => {},
    namespace: 'editor'
  })

  editor.setEditorState(editor.parseEditorState(initialContent))

  useEffect(() => {
    editor.update(() => {
      setHTML($generateHtmlFromNodes(editor, null))
    })
  }, [editor])

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
