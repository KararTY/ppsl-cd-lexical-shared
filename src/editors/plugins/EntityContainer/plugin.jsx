import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  COMMAND_PRIORITY_LOW,
  ElementNode,
  ParagraphNode,
  RootNode,
  TextNode
} from 'lexical'
import { useEffect } from 'react'

import cdROMImage from '#/assets/CD-ROM.png'

import { $createEntityImageNode, EntityImageNode } from '../EntityImage/node'
import {
  $createEntityShortDescriptionNode,
  EntityShortDescriptionNode
} from '../EntityShortDescription/node'
import {
  $createEntityLongDescriptionNode,
  EntityLongDescriptionNode
} from '../EntityLongDescription/node'

import { $createEntityContainerNode, EntityContainerNode } from './node'
import { INSERT_ENTITYCONTAINER_COMMAND } from './utils'

/**
 * @param {import('lexical').LexicalNode} node
 */
const isText = (node) =>
  node instanceof TextNode || node instanceof ParagraphNode

/**
 * @param {import('lexical').ElementNode} node
 */
function removeDirectDescendantTextNodes (node) {
  const children = node.getChildren()

  for (let index = 0; index < children.length; index++) {
    const child = children[index]
    if (isText(child)) {
      /**
       * @type {ElementNode}
       */
      const elementSibling = children.find(
        (sibling) => sibling instanceof ElementNode && !isText(sibling)
      )

      if (elementSibling) {
        elementSibling.append(child)
      } else {
        child.remove()
      }
    }
  }
}

export function EntityContainerPlugin () {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (
      !editor.hasNodes([
        EntityContainerNode,
        EntityImageNode,
        EntityShortDescriptionNode,
        EntityLongDescriptionNode
      ])
    ) {
      throw new Error(
        'EntityContainerPlugin: EntityContainerNode, EntityImageNode, EntityShortDescriptionNode or EntityLongDescriptionNode not registered on editor.'
      )
    }

    editor.registerCommand(
      INSERT_ENTITYCONTAINER_COMMAND,
      () => {
        editor.update(() => {
          const entityImage = $createEntityImageNode({ src: cdROMImage })
          const entityShortDescription =
            $createEntityShortDescriptionNode().append($createParagraphNode())

          const entityLongDescription =
            $createEntityLongDescriptionNode().append($createParagraphNode())

          const entityContainer = $createEntityContainerNode().append(
            entityImage,
            entityShortDescription,
            entityLongDescription
          )
          $getRoot().clear().append(entityContainer)

          entityShortDescription.selectEnd()
        })

        return true
      },
      COMMAND_PRIORITY_LOW
    )

    editor.registerNodeTransform(EntityContainerNode, (node) => {
      removeDirectDescendantTextNodes(node)

      const hasLongDescription = node
        ?.getChildren()
        .find((child) => child instanceof EntityLongDescriptionNode)

      if (!hasLongDescription) node.append($createEntityLongDescriptionNode())
    })

    editor.registerNodeTransform(EntityShortDescriptionNode, (node) => {
      const parentNode = node.getParent()
      const hasShortDescriptions = parentNode
        ?.getChildren()
        .filter((child) => child instanceof EntityShortDescriptionNode)

      if (
        !parentNode ||
        !(parentNode instanceof EntityContainerNode) ||
        hasShortDescriptions.length > 1
      ) {
        node.replace($createParagraphNode(), true)
      }
    })

    editor.registerNodeTransform(EntityShortDescriptionNode, (node) => {
      const hasParagraph = node
        ?.getChildren()
        .find((child) => child instanceof ParagraphNode)

      if (!hasParagraph) node.append($createParagraphNode())
    })

    editor.registerNodeTransform(EntityLongDescriptionNode, (node) => {
      const parentNode = node.getParent()
      const hasLongDescriptions = parentNode
        ?.getChildren()
        .filter((child) => child instanceof EntityLongDescriptionNode)

      if (
        !parentNode ||
        !(parentNode instanceof EntityContainerNode) ||
        hasLongDescriptions.length > 1
      ) {
        node.replace($createParagraphNode(), true)
      }
    })

    editor.registerNodeTransform(EntityLongDescriptionNode, (node) => {
      const hasParagraph = node
        ?.getChildren()
        .find((child) => child instanceof ParagraphNode)

      if (!hasParagraph) node.append($createParagraphNode())
    })

    editor.registerNodeTransform(EntityImageNode, (node) => {
      const parentNode = node.getParent()
      const hasImageNodes = parentNode
        ?.getChildren()
        .filter((child) => child instanceof EntityImageNode)

      if (
        !parentNode ||
        !(parentNode instanceof EntityContainerNode) ||
        hasImageNodes.length > 1
      ) {
        node.replace($createTextNode())
      }
    })

    editor.registerNodeTransform(RootNode, (node) =>
      removeDirectDescendantTextNodes(node)
    )
  }, [editor])

  return null
}
