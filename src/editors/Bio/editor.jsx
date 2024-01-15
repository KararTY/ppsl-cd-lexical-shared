import { useRef, useState } from 'react'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin'

import { defaultTheme, editableEditorTheme, readOnlyTheme } from '../theme'

import { Placeholder } from '../components/placeholder'
import { Editor } from '../components/editor'
import { EditorFooter } from '../components/footer'
import useIsClient from '../components/useIsClient'

import { useYJSProvider } from '../plugins/YJS'

import { bioConfig } from './config'
import { getToolbarTitle } from '../Entity/utils'
import { Toolbar } from '../toolbar'

/**
 * @param {{readOnly, post, content, user}} props
 */
export function BioEditor (props) {
  const { readOnly = false, title, post = {}, onSubmit, content, user } = props

  const isClient = useIsClient()
  const [isSaving, setIsSaving] = useState(false)

  const onSubmitCatch = async ({ event, editor }) => {
    setIsSaving(true)
    await onSubmit({ event, editor })
    setIsSaving(false)
  }

  const config = bioConfig(defaultTheme, !readOnly, function onError (error) {
    throw error
  })
  config.editorState = null

  const editorTheme = !readOnly ? editableEditorTheme : readOnlyTheme
  config.theme = { ...config.theme, ...editorTheme }

  /**
   * @type {React.Ref<null | import('lexical').LexicalEditor>}
   */
  const editorRef = useRef(null)

  const providerFactory = useYJSProvider(editorRef)

  return (
    <LexicalComposer initialConfig={config}>
      <Editor editorRef={editorRef} onSubmit={onSubmitCatch}>
        <article className={config.theme.article}>
          {!readOnly && (
            <Toolbar title={getToolbarTitle(title, readOnly, post)} />
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
            {isClient && (
              <CollaborationPlugin
                id={post.id}
                providerFactory={providerFactory}
                initialEditorState={initialState}
                shouldBootstrap
                username={user.id}
              />
            )}
            <AutoFocusPlugin />
          </div>

          {!readOnly && <EditorFooter isSaving={isSaving} />}
        </article>
      </Editor>
    </LexicalComposer>
  )
}
