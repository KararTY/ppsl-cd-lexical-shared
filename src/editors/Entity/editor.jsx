import * as Y from 'yjs'
import { useEffect, useState, useRef } from 'react'
import { ParagraphNode } from 'lexical'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'

import { defaultTheme, editableEditorTheme, readOnlyTheme } from '../theme'
import { Toolbar } from '../toolbar/index'
import { Placeholder } from '../components/placeholder'
import { Editor } from '../components/editor'
import { EditorFooter } from '../components/footer'
import useIsClient from '../components/useIsClient'

import { INSERT_ENTITYCONTAINER_COMMAND } from '../plugins/EntityContainer/utils'
import { EntityContainerPlugin } from '../plugins/EntityContainer/plugin'
import { EntityMentionPlugin } from '../plugins/EntityMention/plugin'
import { ImageModalPlugin } from '../plugins/EntityImage/ImageModalPlugin'
import { useYJSProvider } from '../plugins/YJS'

import { entityConfig } from './config'
import { getToolbarTitle } from './utils'
import { stringToUint8Array } from '#/lib/yjs'

function initialState (editor) {
  editor.dispatchCommand(INSERT_ENTITYCONTAINER_COMMAND)
}

/**
 * @param {{readOnly, onSubmit, post, title, content, user}} props
 */
export function EntityEditor (props) {
  const { readOnly = false, onSubmit, post = {}, title, content, user } = props

  const [yDoc] = useState(new Y.Doc())

  /**
   * @type {React.Ref<null | import('lexical').LexicalEditor>}
   */
  const editorRef = useRef(null)
  const providerFactory = useYJSProvider(yDoc)

  const isClient = useIsClient()

  const [isSaving, setIsSaving] = useState(false)

  const onSubmitCatch = async (...args) => {
    setIsSaving(true)
    await onSubmit?.(...args)
    setIsSaving(false)
  }

  const config = entityConfig(defaultTheme, !readOnly, function onError (error) {
    throw error
  })
  config.editorState = null // Set by CollaborationPlugin

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
        const children = node.getChildren()
        parent.append(...children)
        node.remove()
      }
    })

    if (content) {
      const uint8ArrayContent = stringToUint8Array(content)
      const update = Y.encodeStateAsUpdateV2(uint8ArrayContent)
      Y.applyUpdate(yDoc, update)
    }
  }, [editorRef, content, yDoc])

  return (
    <LexicalComposer initialConfig={config}>
      <Editor editorRef={editorRef} onSubmit={onSubmitCatch} yDoc={yDoc}>
        <article className={config.theme.article}>
          <AutoFocusPlugin />

          {!readOnly && (
            <Toolbar title={getToolbarTitle(title, readOnly, post)} />
          )}

          <div className={config.theme.body}>
            <EntityContainerPlugin />

            {!readOnly && <ImageModalPlugin />}

            {isClient && <EntityMentionPlugin />}

            <RichTextPlugin
              placeholder={!readOnly && <Placeholder />}
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
                shouldBootstrap={!content}
                username={user.id}
              />
            )}
          </div>

          {!readOnly && <EditorFooter isSaving={isSaving} />}
        </article>
      </Editor>
    </LexicalComposer>
  )
}
