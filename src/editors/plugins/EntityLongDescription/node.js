import lexical from 'lexical'
const { ElementNode } = lexical

/**
 * @typedef {import('lexical').EditorConfig} EditorConfig
 * @typedef {import('lexical').LexicalNode} LexicalNode
 */

export class EntityLongDescriptionNode extends ElementNode {
  static getType () {
    return 'entity-long-description'
  }

  /**
   * @param {EntityLongDescriptionNode} node
   */
  static clone (node) {
    return new EntityLongDescriptionNode(node.__key)
  }

  /**
   * @param {EditorConfig} config
   */
  createDOM (config) {
    const element = document.createElement('div')
    element.dataset.type = this.getType()

    element.className = config.theme.entityLongDescription ?? this.getType()

    return element
  }

  updateDOM () {
    return false
  }

  static importJSON () {
    return $createEntityLongDescriptionNode()
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

export function $createEntityLongDescriptionNode (props) {
  return new EntityLongDescriptionNode(props)
}

/**
 * @param {LexicalNode} node
 */
export function $isEntityLongDescriptionNode (node) {
  return node instanceof EntityLongDescriptionNode
}
