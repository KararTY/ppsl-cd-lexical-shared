let myModule

if (typeof globalThis?.window !== 'undefined') {
  myModule = await import('./Image.jsx')
} else {
  myModule = () => 'SSR'
}

export default myModule
