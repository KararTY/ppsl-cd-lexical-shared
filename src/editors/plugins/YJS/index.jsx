import * as Y from 'yjs'
import { base64ToUint8Array } from 'uint8array-extras'
import { IndexeddbPersistence } from 'y-indexeddb'
import { useCallback } from 'react'

export function useYJSProvider (yDocRef, update) {
  return useCallback(
    (...args) => providerFactory(yDocRef, update, ...args),
    [yDocRef, update]
  )
}

const noop = () => {}

/**
 * @type {undefined | Y.Doc}
 */
let yDoc

/**
 * @type {undefined | import('@lexical/yjs').Provider}
 */
let provider

/**
 * @param {React.Ref<null | Y.Doc} yDocRef
 * @param {Uint8Array} update
 * @param {string} id
 * @param {Map<string, Y.Doc>} yjsDocMap
 * @returns {import('@lexical/yjs').Provider}
 */
function providerFactory (yDocRef, update, id = 'new', yjsDocMap) {
  if (provider) {
    yDocRef.current = yDoc
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

  persistence.once('synced', () => {
    if (update) {
      // https://github.com/yjs/yjs/blob/52b906898fee761a6223eeef6a33adc2a4041b80/README.md#example-syncing-clients-without-loading-the-ydoc

      // Current
      const currentStateUpdate = Y.encodeStateAsUpdate(doc)
      const stateVector = Y.encodeStateVectorFromUpdate(currentStateUpdate)

      // Incoming update
      const uint8ArrayContent = base64ToUint8Array(update)
      const convertedUpdate = Y.convertUpdateFormatV2ToV1(uint8ArrayContent)

      // Diff the updates
      const diff = Y.diffUpdate(convertedUpdate, stateVector)

      Y.applyUpdate(doc, diff)
    }
  })

  yDoc = doc
  yDocRef.current = yDoc

  provider = persistence

  return provider
}
