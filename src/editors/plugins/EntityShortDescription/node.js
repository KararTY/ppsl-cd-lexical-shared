import { addClassNamesToElement } from '@lexical/utils'
import { ElementNode } from 'lexical'

/**
 * @typedef {import('lexical').EditorConfig} EditorConfig
 * @typedef {import('lexical').LexicalNode} LexicalNode
 */

export class EntityShortDescriptionNode extends ElementNode {
  static getType () {
    return 'entity-short-description'
  }

  /**
   * @param {EntityShortDescriptionNode} node
   */
  static clone (node) {
    return new EntityShortDescriptionNode(node.__key)
  }

  /**
   * @param {EditorConfig} config
   */
  createDOM (config) {
    const element = document.createElement('div')
    element.dataset.type = this.getType()

    addClassNamesToElement(
      element,
      config.theme.entityShortDescription ?? this.getType()
    )

    return element
  }

  updateDOM () {
    return false
  }

  static importJSON () {
    return $createEntityShortDescriptionNode()
  }

  exportJSON () {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      version: 1
    }
  }

  remove () {
    return false
  }

  canMergeWith () {
    return false
  }
}

export function $createEntityShortDescriptionNode (props) {
  return new EntityShortDescriptionNode(props)
}

/**
 * @param {LexicalNode} node
 */
export function $isEntityShortDescriptionNode (node) {
  return node instanceof EntityShortDescriptionNode
}
