import { useState } from 'react'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'

import { TreeViewPlugin } from '../plugins/TreeView/plugin'

import { defaultTheme, editableEditorTheme, readOnlyTheme } from '../theme'
import { bioConfig } from './config'
import { Toolbar } from '../toolbar/index'
import { Placeholder } from '../components/placeholder'
import { Editor } from '../components/editor'
import { EditorFooter } from '../components/footer'

/**
 * @param {{readOnly, post, initialContent}} props
 */
export function BioEditor (props) {
  const { readOnly = false, title, post = {}, initialContent, onSubmit } = props

  const [isSaving, setIsSaving] = useState(false)

  const onSubmitCatch = async ({ event, editor }) => {
    setIsSaving(true)
    await onSubmit({ event, editor })
    setIsSaving(false)
  }

  const config = bioConfig(defaultTheme, !readOnly, function onError (error) {
    throw error
  })

  if (initialContent) {
    config.editorState = initialContent
  }

  const editorTheme = !readOnly ? editableEditorTheme : readOnlyTheme

  config.theme = { ...config.theme, ...editorTheme }

  return (
    <LexicalComposer initialConfig={config}>
      <Editor onSubmit={onSubmitCatch}>
        <article className={config.theme.article}>
          {!readOnly && (
            <Toolbar
              title={
                title ?? `${!readOnly ? 'Editing ' : ''}${post.title || 'Post'}`
              }
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

      <TreeViewPlugin />
    </LexicalComposer>
  )
}
