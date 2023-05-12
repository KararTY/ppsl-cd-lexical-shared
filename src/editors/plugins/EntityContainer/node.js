import lexical from 'lexical'
const { ElementNode } = lexical

/**
 * @typedef {import('lexical').EditorConfig} EditorConfig
 * @typedef {import('lexical').LexicalNode} LexicalNode
 */

export class EntityContainerNode extends ElementNode {
  static getType () {
    return 'entity-container'
  }

  /**
   * @param {EntityContainerNode} node
   */
  static clone (node) {
    return new EntityContainerNode(node.__key)
  }

  /**
   * @param {EditorConfig} config
   */
  createDOM (config) {
    const element = document.createElement('div')
    element.dataset.type = this.getType()

    element.className = config.theme.entityContainer ?? this.getType()

    return element
  }

  updateDOM () {
    return false
  }

  canMergeWith () {
    return false
  }

  static importJSON () {
    return $createEntityContainerNode()
  }

  exportJSON () {
    return {
      children: [],
      type: this.getType(),
      version: 1
    }
  }

  remove () {
    return false
  }

  isInline () {
    return false
  }
}

export function $createEntityContainerNode () {
  return new EntityContainerNode()
}

/**
 * @param {LexicalNode} node
 */
export function $isEntityContainerNode (node) {
  return node instanceof EntityContainerNode
}
