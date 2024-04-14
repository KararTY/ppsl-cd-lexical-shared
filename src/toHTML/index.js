globalThis.SSR = true

const { toHTML } = await import('./lexicalHTMLLinkedDom.js')

export default toHTML
