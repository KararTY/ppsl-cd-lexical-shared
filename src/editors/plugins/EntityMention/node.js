/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license.
 */

/**
 * Modified from original source
 * https://github.com/facebook/lexical/blob/7150421fabb25fef65f62e18e097d0a8d4a2cde9/packages/lexical-playground/src/nodes/MentionNode.ts
 */

import lexical from 'lexical'
const { $applyNodeReplacement, TextNode } = lexical

/**
 * @typedef {import('lexical').LexicalEditor} LexicalEditor
 * @typedef {import('lexical').EditorConfig} EditorConfig
 * @typedef {import('lexical').LexicalNode} LexicalNode
 * @typedef {import('lexical').NodeKey} NodeKey
 */

/**
 * @param {HTMLElement} domNode
 */
function convertMentionElement (domNode) {
  const textContent = domNode.textContent

  if (textContent !== null) {
    const node = $createEntityMentionNode({
      title: textContent,
      postId: domNode.dataset.postId
    })

    return {
      node
    }
  }

  return null
}

const mentionStyle = 'background-color: rgba(24, 119, 232, 0.2)'

export class EntityMentionNode extends TextNode {
  __postId = ''

  static getType () {
    return 'entity-mention'
  }

  /**
   * @param {EntityMentionNode} node
   */
  static clone (node) {
    return new EntityMentionNode(node.__postId, node.__text, node.__key)
  }

  static importJSON (serializedNode) {
    const node = $createEntityMentionNode(serializedNode)

    node.setTextContent(serializedNode.text)
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)

    return node
  }

  /**
   * @param {string} postId
   * @param {string?} text
   * @param {NodeKey?} key
   */
  constructor (postId, text, key) {
    super(text ?? postId, key)

    this.__postId = postId
  }

  exportJSON () {
    return {
      ...super.exportJSON(),
      postId: this.__postId,
      type: this.getType(),
      version: 1
    }
  }

  /**
   * @param {EditorConfig} config
   */
  createDOM (config) {
    const dom = super.createDOM(config)

    if (!config.theme.entityMention) {
      dom.style.cssText = mentionStyle
    }

    dom.className = config.theme.entityMention || this.getType()
    return dom
  }

  // For when copied.
  exportDOM () {
    const element = document.createElement('a')

    element.dataset.type = this.getType()

    const location = globalThis?.window?.location

    const pathname = `/post/${this.getPostId()}`

    if (location) {
      element.href = `${location.origin}${pathname}`
    } else {
      element.href = pathname
    }

    element.setAttribute('data-post-id', this.getPostId())

    element.textContent = this.__text

    return { element }
  }

  // For when copy-pasted.
  static importDOM () {
    return {
      a: (domNode) => {
        if (!domNode.getAttribute('data-type') === this.getType()) {
          return null
        }

        return {
          conversion: convertMentionElement,
          priority: 1
        }
      }
    }
  }

  isToken () {
    return true
  }

  isTextEntity () {
    return true
  }

  getPostId () {
    return this.__postId
  }
}

/**
 * @param {{title: string, postId: string}}
 * @returns {EntityMentionNode}
 */
export function $createEntityMentionNode ({ title, postId }) {
  const mentionNode = new EntityMentionNode(postId, title)

  mentionNode.setMode('segmented').toggleDirectionless()

  return $applyNodeReplacement(mentionNode)
}

/**
 * @param {LexicalNode} node
 */
export function $isMentionNode (node) {
  return node instanceof EntityMentionNode
}
