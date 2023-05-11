import { useState } from 'react'
import { encode } from '@msgpack/msgpack'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'

import { defaultTheme, editableEditorTheme, readOnlyTheme } from '../theme'
import { Toolbar } from '../toolbar/index'
import { Placeholder } from '../components/placeholder'
import { Editor } from '../components/editor'
import { EditorFooter } from '../components/footer'
import { bioConfig } from './config'

/**
 * @param {{readOnly, post, initialContent}} props
 */
export function BioEditor (props) {
  const { readOnly = false, post = {}, initialContent } = props

  const [isSaving, setIsSaving] = useState(false)

  const onSubmitBio = async ({ event, editor }) => {
    event.preventDefault()

    const content = editor.getEditorState().toJSON()
    const encodedContent = encode(content).toString()

    const headers = new Headers()
    headers.append('content-type', 'application/json')

    setIsSaving(true)

    try {
      const res = await fetch('/api/users/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: encodedContent
        })
      })

      if (res.status >= 200 && res.status < 300) window.location.reload()
      else throw res
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const config = bioConfig(defaultTheme, !readOnly)

  if (initialContent) {
    config.editorState = initialContent
  }

  const editorTheme = !readOnly ? editableEditorTheme : readOnlyTheme

  config.theme = { ...config.theme, ...editorTheme }

  return (
    <LexicalComposer initialConfig={config}>
      <Editor onSubmit={onSubmitBio}>
        <article className={config.theme.article}>
          {!readOnly && (
            <Toolbar
              title={`${!readOnly ? 'Editing ' : ''}${post.title || 'Post'}`}
            />
          )}

          <div className={config.theme.body}>
            <RichTextPlugin
              placeholder={
                !readOnly && (
                  <Placeholder>
                    Enter some <strong>rich text</strong>...
                  </Placeholder>
                )
              }
              contentEditable={
                <ContentEditable className={config.theme.contentEditable} />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
          </div>

          {!readOnly && <EditorFooter isSaving={isSaving} />}
        </article>
      </Editor>
    </LexicalComposer>
  )
}
