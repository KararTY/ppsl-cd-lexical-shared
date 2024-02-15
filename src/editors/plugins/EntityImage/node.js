import lexical from 'lexical'
import Image from './Image.js'

const { DecoratorNode } = lexical

/**
 * @typedef {import('lexical').LexicalEditor} LexicalEditor
 * @typedef {import('lexical').EditorConfig} EditorConfig
 * @typedef {import('lexical').LexicalNode} LexicalNode
 * @typedef {import('lexical').NodeKey} NodeKey
 */

/**
 * @typedef {{ alt: string, src: string }} EntityImageProps
 */

export class EntityImageNode extends DecoratorNode {
  __src = ''
  __alt = ''

  /**
   * @param {EntityImageProps} props
   * @param {NodeKey?} key
   */
  constructor (props, key) {
    super(key)

    const { src = '', alt = '' } = props || {}
    this.__src = src
    this.__alt = alt
  }

  static getType () {
    return 'entity-image'
  }

  /**
   * @param {EntityImageNode} node
   */
  static clone (node) {
    return new EntityImageNode(
      { alt: node.getAlt(), src: node.getSrc() },
      node.__key
    )
  }

  /**
   * @param {EditorConfig} config
   */
  createDOM (config) {
    const element = document.createElement('div')
    element.dataset.type = this.getType()

    element.className = config.theme.entityImage ?? this.getType()

    element.src = this.__src
    element.alt = this.__alt

    return element
  }

  /**
   * @param {EntityImageNode} prevNode
   * @param {HTMLImageElement} dom
   */
  updateDOM (prevNode, dom) {
    if (prevNode.__src !== this.__src) {
      dom.__src = this.__src
    }

    if (prevNode.__alt !== this.__alt) {
      dom.__alt = this.__alt
    }

    return false
  }

  /**
   * @param {LexicalEditor} editor
   */
  exportDOM (editor) {
    const element = document.createElement('img')
    element.setAttribute('src', this.__src)

    element.dataset.type = this.getType()

    element.className = editor._config.theme.entityImage ?? this.getType()

    return { element }
  }

  static importJSON (props) {
    return $createEntityImageNode(props)
  }

  exportJSON () {
    return {
      src: this.getSrc(),
      alt: this.getAlt(),
      type: this.getType(),
      version: 1
    }
  }

  decorate () {
    if (typeof globalThis?.window !== 'undefined' && !globalThis?.SSR) {
      return Image.default({ src: this.__src, alt: this.__alt })
    }
  }

  getTextContent () {
    const alt = this.getAlt()
    return `${alt ? `${alt}: ` : ''}${this.getSrc()}`
  }

  remove () {
    return false
  }

  /**
   * @param {string} src
   */
  setSrc (src) {
    const writable = this.getWritable()

    writable.__src = src
  }

  getSrc () {
    return this.__src
  }

  /**
   * @param {string} alt
   */
  setAlt (alt) {
    const writable = this.getWritable()

    writable.__alt = alt
  }

  getAlt () {
    return this.__alt
  }
}

/**
 * @param {EntityImageProps} props
 */
export function $createEntityImageNode (props) {
  return new EntityImageNode(props)
}

/**
 * @param {LexicalNode} node
 */
export function $isEntityImageNode (node) {
  return node instanceof EntityImageNode
}
