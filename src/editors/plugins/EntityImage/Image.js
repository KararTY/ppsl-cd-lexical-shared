let myModule

if (typeof globalThis?.window !== 'undefined' && !globalThis?.SSR) {
  myModule = await import('./Image.jsx')
} else {
  myModule = () => 'SSR'
}

export default myModule
