import { IndexeddbPersistence } from 'y-indexeddb'
import { useCallback } from 'react'

export function useYJSProvider (yDoc) {
  return useCallback((...args) => providerFactory(yDoc, ...args), [yDoc])
}

const noop = () => {}

function providerFactory (yDoc, id, yjsDocMap) {
  const persistence = new IndexeddbPersistence(id, yDoc)

  globalThis._persistence = persistence
  // globalThis._doc = yDoc
  // globalThis._Y = Y
  // globalThis._editorRef = editorRef

  yjsDocMap.set(id, yDoc)

  persistence.awareness = {
    setLocalState: noop,
    getStates: () => [],
    getLocalState: () => null,
    on: noop,
    off: noop
  }

  persistence.connect = noop
  persistence.on('synced', (...args) => persistence.emit('sync', args))

  return persistence
}
