import { useState } from 'react'
import { $getNodeByKey } from 'lexical'

import { NodeEventPlugin } from '@lexical/react/LexicalNodeEventPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

import { RenderModal } from '#/components/modal'
import { ChooseImageModal } from '#/components/modal/ChooseImageModal'

import { titleFromURLString } from '../../Entity/utils'
import { EntityImageNode } from './node'

export function ImageModalPlugin () {
  const [editor] = useLexicalComposerContext()

  const [showImageModal, setShowImageModal] = useState(false)

  const handleImageModalClose = () => {
    setShowImageModal(false)
  }

  /**
   * @param {EntityImageNode} node
   * @param {string} url
   */
  const handleImageModalSubmit = ({ nodeKey }, url) => {
    editor.update(() => {
      /**
       * @type {EntityImageNode}
       */
      const imageNode = $getNodeByKey(nodeKey)
      const tempAlt = titleFromURLString(url)

      if (imageNode) {
        imageNode.setSrc(url)
        imageNode.setAlt(tempAlt)
      }
    })

    handleImageModalClose()
  }

  return (
    <>
      <NodeEventPlugin
        nodeType={EntityImageNode}
        eventType="click"
        eventListener={(_, __, nodeKey) => {
          /**
           * @type {EntityImageNode}
           */
          const imageNode = $getNodeByKey(nodeKey)

          setShowImageModal({
            nodeKey,
            url: titleFromURLString(imageNode.getSrc())
          })
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
  )
}
