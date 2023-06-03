globalThis.SSR = true

const { toHTML } = await import('./lexicalHTML.js')

export default toHTML
