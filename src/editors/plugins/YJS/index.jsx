import * as Y from 'yjs'
import { base64ToUint8Array } from 'uint8array-extras'
import { IndexeddbPersistence } from 'y-indexeddb'
import { useCallback } from 'react'

export function useYJSProvider (update) {
  return useCallback((...args) => providerFactory(update, ...args), [update])
}

const noop = () => {}

let provider

/**
 * @param {Uint8Array} update
 * @param {string} id
 * @param {Map<string, Y.Doc>} yjsDocMap
 * @returns {import('@lexical/yjs').Provider}
 */
function providerFactory (update, id = 'new', yjsDocMap) {
  if (provider) {
    return provider
  }

  // https://github.com/facebook/lexical/issues/3085#issuecomment-1498064163

  let doc = yjsDocMap.get(id)

  if (doc === undefined) {
    doc = new Y.Doc()
    yjsDocMap.set(id, doc)
  } else {
    doc.load()
  }

  const persistence = new IndexeddbPersistence(id, doc)

  // This is for resetEditorModalContent.
  globalThis._persistence = persistence

  persistence.awareness = {
    setLocalState: noop,
    getStates: () => [],
    getLocalState: () => null,
    on: noop,
    off: noop
  }

  persistence.connect = noop

  persistence.on('synced', (...args) => {
    persistence.emit('sync', args)
  })


  provider = persistence

  return provider
}
