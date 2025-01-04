import * as lexical from 'lexical'
import * as lexicalUtils from '@lexical/utils'

import {
  $createEntityImageNode,
  EntityImageNode
} from '../EntityImage/node.js'
import {
  $createEntityShortDescriptionNode,
  EntityShortDescriptionNode
} from '../EntityShortDescription/node.js'
import {
  $createEntityLongDescriptionNode,
  EntityLongDescriptionNode
} from '../EntityLongDescription/node.js'
import { $createEntityContainerNode, EntityContainerNode } from './node.js'

const {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  COMMAND_PRIORITY_LOW,
  createCommand,
  ElementNode,
  ParagraphNode,
  RootNode,
  TextNode
} = lexical

const { mergeRegister } = lexicalUtils

export const RESET_EDITOR = createCommand('resetEditor')

export const INSERT_ENTITYCONTAINER_COMMAND = createCommand(
  'insertEntityContainer'
)

/**
 * @param {import('lexical').LexicalEditor} editor
 */
export const registerInsertEntityContainerCommand = (editor) =>
  editor.registerCommand(
    INSERT_ENTITYCONTAINER_COMMAND,
    () => {
      editor.update(
        () => {
          const entityImage = $createEntityImageNode({ src: '' })
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
        }
      )
    },
    COMMAND_PRIORITY_LOW
  )

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

/**
 * @param {import('lexical').LexicalEditor} editor
 */
export const registerEntityNodeTransforms = (editor) =>
  mergeRegister(
    editor.registerNodeTransform(EntityContainerNode, (node) => {
      removeDirectDescendantTextNodes(node)

      const hasLongDescription = node
        ?.getChildren()
        .find((child) => child instanceof EntityLongDescriptionNode)

      if (!hasLongDescription) {
        node.append($createEntityLongDescriptionNode())
      }
    }),

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
    }),

    editor.registerNodeTransform(EntityShortDescriptionNode, (node) => {
      const hasParagraph = node
        ?.getChildren()
        .find((child) => child instanceof ParagraphNode)

      if (!hasParagraph) {
        node.append($createParagraphNode())
      }
    }),

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
    }),

    editor.registerNodeTransform(EntityLongDescriptionNode, (node) => {
      const hasParagraph = node
        ?.getChildren()
        .find((child) => child instanceof ParagraphNode)

      if (!hasParagraph) {
        node.append($createParagraphNode())
      }
    }),

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
    }),

    editor.registerNodeTransform(RootNode, (node) =>
      removeDirectDescendantTextNodes(node)
    )
  )
