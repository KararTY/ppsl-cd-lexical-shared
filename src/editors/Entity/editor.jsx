import { useEffect, useState, useRef } from 'react'
import { $getNodeByKey, $getRoot, ParagraphNode } from 'lexical'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { NodeEventPlugin } from '@lexical/react/LexicalNodeEventPlugin'

import { defaultTheme, editableEditorTheme, readOnlyTheme } from '../theme'
import { Toolbar } from '../toolbar/index'
import { Placeholder } from '../components/placeholder'
import { Editor } from '../components/editor'
import { EditorFooter } from '../components/footer'

import {
  EntityContainerPlugin,
  INSERT_ENTITYCONTAINER_COMMAND
} from '../plugins/EntityContainer/plugin'
import { EntityImageNode } from '../plugins/EntityImage/node'
import { EntityMentionPlugin } from '../plugins/EntityMention/plugin'
import { TreeViewPlugin } from '../plugins/TreeView/plugin'

import { RenderModal } from '@/components/modal'
import { ChooseImageModal } from '@/components/modal/ChooseImageModal'
import { entityConfig } from './config'

/**
 * @param {{readOnly, onSubmit, post, title, initialContent}} props
 */
export function EntityEditor (props) {
  const {
    readOnly = false,
    onSubmit = () => {},
    post = {},
    title,
    initialContent
  } = props

  const [showImageModal, setShowImageModal] = useState(false)

  const [isSaving, setIsSaving] = useState(false)

  const onSubmitCatch = async ({ event, editor }) => {
    setIsSaving(true)
    await onSubmit({ event, editor })
    setIsSaving(false)
  }

  /**
   * @type {React.Ref<null | import('lexical').LexicalEditor>}
   */
  const editorRef = useRef(null)

  const config = entityConfig(defaultTheme, !readOnly, function onError (error) {
    throw error
  })

  // **INITIAL** state.
  if (initialContent) {
    config.editorState = initialContent
  }

  const editorTheme = !readOnly ? editableEditorTheme : readOnlyTheme

  config.theme = { ...config.theme, ...editorTheme }

  const handleImageModalClose = () => {
    setShowImageModal(false)
  }

  /**
   * @param {EntityImageNode} node
   * @param {string} url
   */
  const handleImageModalSubmit = (nodeKey, url) => {
    const editor = editorRef.current

    editor.update(() => {
      /**
       * @type {EntityImageNode}
       */
      const imageNode = $getNodeByKey(nodeKey)

      if (imageNode) {
        imageNode.setSrc(url)
      }
    })

    handleImageModalClose()
  }

  useEffect(() => {
    const editor = editorRef.current

    if (initialContent || !editor) {
      return
    }

    editor.update(() => {
      // https://github.com/facebook/lexical/issues/2308
      const textInEditor = $getRoot().getTextContent().trim()

      if (textInEditor.length === 0) {
        editor.dispatchCommand(INSERT_ENTITYCONTAINER_COMMAND)
      }
    })

    editor.registerNodeTransform(ParagraphNode, (node) => {
      const parent = node.getParent()

      if (parent instanceof ParagraphNode) {
        const children = node.getChildren()
        parent.append(...children)
        node.remove()
      }
    })
  }, [editorRef])

  return (
    <LexicalComposer initialConfig={config}>
      <Editor editorRef={editorRef} onSubmit={onSubmitCatch}>
        <article className={config.theme.article}>
          {!readOnly && (
            <Toolbar
              title={
                title ?? `${!readOnly ? 'Editing ' : ''}${post.title || 'Post'}`
              }
            />
          )}

          <div className={config.theme.body}>
            <EntityContainerPlugin />
            {!readOnly && (
              <>
                <NodeEventPlugin
                  nodeType={EntityImageNode}
                  eventType="click"
                  eventListener={(e, _, nodeKey) => {
                    setShowImageModal(nodeKey)
                  }}
                />
                <RenderModal>
                  {showImageModal && (
                    <ChooseImageModal
                      data={showImageModal}
                      onClose={handleImageModalClose}
                      onSubmit={handleImageModalSubmit}
                    />
                  )}
                </RenderModal>
              </>
            )}
            {globalThis.document && <EntityMentionPlugin />}
            <RichTextPlugin
              placeholder={!readOnly && <Placeholder />}
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
