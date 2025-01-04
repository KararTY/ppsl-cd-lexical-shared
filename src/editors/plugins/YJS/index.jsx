import * as Y from 'yjs'
import { base64ToUint8Array } from 'uint8array-extras'
import { IndexeddbPersistence } from 'y-indexeddb'
import { useCallback } from 'react'

const noop = () => {}

/**
 * @typedef {IndexeddbPersistence & { awareness: any, connect: typeof noop, disconnect: typeof noop }} IndexeddbPersistenceProvider
 *
 * @typedef {{ yDocRef: React.Ref<null | Y.Doc>, update: string, id: string, yjsDocMap: Map<string, Y.Doc>, initialUpdate?: string }} ProviderFactory
 */

/**
 * @type {undefined | Y.Doc}
 */
let yDoc

/**
 * @type {undefined | import('@lexical/yjs').Provider}
 */
let provider

/**
 * @param {ProviderFactory} arg1
 * @returns {import('@lexical/yjs').Provider}
 */
function providerFactory ({
  yDocRef,
  update,
  id = 'new',
  yjsDocMap,
  initialUpdate
}) {
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

  /**
   * @type {IndexeddbPersistenceProvider}
   */
  // @ts-ignore
  const idbPersistence = new IndexeddbPersistence(id, doc)

  idbPersistence.connect = noop
  idbPersistence.disconnect = idbPersistence.destroy
  idbPersistence.awareness = {
    setLocalState: noop,
    getStates: () => [],
    getLocalState: () => null,
    on: noop,
    off: noop
  }

  const persistence = idbPersistence

  persistence.on('synced', (/** @type {any[]} */ ...args) => {
    persistence.emit('sync', args)
  })

  persistence.once('synced', () => {
    let useInitialUpdate = false

    if (doc.get('root', Y.XmlText).length === 0) {
      useInitialUpdate = true
    }

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

    if (!update && useInitialUpdate && initialUpdate) {
      const currentStateUpdate = Y.encodeStateAsUpdate(doc)

      const stateVector = Y.encodeStateVectorFromUpdate(currentStateUpdate)

      // Incoming update
      const uint8ArrayContent = base64ToUint8Array(initialUpdate)
      const convertedUpdate = Y.convertUpdateFormatV2ToV1(uint8ArrayContent)

      // Diff the updates
      const diff = Y.diffUpdate(convertedUpdate, stateVector)

      Y.applyUpdate(doc, diff)
    }
  })

  // This is for resetEditorModalContent.
  globalThis._persistence = persistence

  yDoc = doc
  yDocRef.current = yDoc

  provider = persistence

  return provider
}

/**
 * @param {ProviderFactory['yDocRef']} yDocRef
 * @param {ProviderFactory['update']} update
 * @param {ProviderFactory['initialUpdate']} initialUpdate
 */
export function useYJSProvider (yDocRef, update, initialUpdate) {
  return useCallback(
    /**
     * @param {ProviderFactory['id']} id
     * @param {ProviderFactory['yjsDocMap']} yjsDocMap
     */
    (id, yjsDocMap) =>
      providerFactory({ yDocRef, update, id, yjsDocMap, initialUpdate }),
    [yDocRef, update, initialUpdate]
  )
}
