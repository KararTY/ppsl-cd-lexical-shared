import { useEffect, useState, useRef } from 'react'
import { ParagraphNode } from 'lexical'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'

import { defaultTheme, editableEditorTheme, readOnlyTheme } from '../theme'
import { Toolbar } from '../toolbar/index'
import { Placeholder } from '../components/placeholder'
import { Editor } from '../components/editor'
import { EditorFooter } from '../components/footer'

import { EntityContainerPlugin } from '../plugins/EntityContainer/plugin'
import { EntityMentionPlugin } from '../plugins/EntityMention/plugin'
import { ImageModalPlugin } from '../plugins/EntityImage/ImageModalPlugin'
import { useYJSProvider } from '../plugins/YJS/useYJSProvider'

import { entityConfig } from './config'
import { getToolbarTitle } from './utils'

/**
 * @param {{readOnly, onSubmit, post, title, update, initialUpdate, user}} props
 */
export function EntityEditor (props) {
  const {
    readOnly = false,
    onSubmit,
    post = {},
    title,
    update,
    initialUpdate,
    user
  } = props

  /**
   * @type {React.Ref<null | import('lexical').LexicalEditor>}
   */
  const editorRef = useRef(null)
  const yDocRef = useRef(null)
  const providerFactory = useYJSProvider(yDocRef, update, initialUpdate)

  const [isSaving, setIsSaving] = useState(false)

  const onSubmitCatch = async (...args) => {
    setIsSaving(true)
    await onSubmit?.(...args)
    setIsSaving(false)
  }

  const config = entityConfig(defaultTheme, !readOnly, null)

  const editorTheme = !readOnly ? editableEditorTheme : readOnlyTheme
  config.theme = { ...config.theme, ...editorTheme }

  useEffect(() => {
    const editor = editorRef.current

    if (!editor) {
      return
    }

    editor.registerNodeTransform(ParagraphNode, (node) => {
      const parent = node.getParent()

      if (parent instanceof ParagraphNode) {
        editor.update(() => {
          const children = node.getChildren()
          parent.append(...children)
          node.remove()
        })
      }
    })
  }, [editorRef])

  return (
    <LexicalComposer initialConfig={config}>
      <Editor onSubmit={onSubmitCatch} editorRef={editorRef} yDocRef={yDocRef}>
        <article className={config.theme.article}>
          <AutoFocusPlugin />

          {!readOnly && (
            <Toolbar title={getToolbarTitle(title, readOnly, post)} />
          )}

          <div className={config.theme.body}>
            <EntityContainerPlugin />

            {!readOnly && <ImageModalPlugin />}

            <EntityMentionPlugin />

            <RichTextPlugin
              placeholder={!readOnly && <Placeholder />}
              contentEditable={
                <ContentEditable className={config.theme.contentEditable} />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>

          {!readOnly && <EditorFooter isSaving={isSaving} />}
        </article>
      </Editor>

      <CollaborationPlugin
        id={post.id}
        providerFactory={providerFactory}
        shouldBootstrap={false}
        username={user.id}
      />
    </LexicalComposer>
  )
}
