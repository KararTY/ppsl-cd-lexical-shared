import * as Y from 'yjs'
import * as lexicalHeadless from '@lexical/headless'
import * as lexicalYjs from '@lexical/yjs'

const { createBinding, syncYjsChangesToLexical } = lexicalYjs

const { createHeadlessEditor } = lexicalHeadless

// https://github.com/facebook/lexical/discussions/4442

/**
 * @param {Uint8Array} update
 */
export function updateToJSON (config, update) {
  const editor = createHeadlessEditor(config)

  const dummyId = 'dummy-id'
  const dummyProvider = {
    awareness: {
      setLocalState: () => {},
      getStates: () => [],
      getLocalState: () => null,
      on: () => {},
      off: () => {}
    }
  }
  const copyTarget = new Y.Doc()
  const copyBinding = createBinding(
    editor,
    dummyProvider,
    dummyId,
    copyTarget,
    new Map([[dummyId, copyTarget]])
  )

  // this syncs yjs changes to the lexical editor
  const onYjsTreeChanges = (events, transaction) => {
    syncYjsChangesToLexical(copyBinding, dummyProvider, events, false)
  }
  copyBinding.root.getSharedType().observeDeep(onYjsTreeChanges)

  // copy the original document to the copy to trigger the observer which updates the editor
  Y.applyUpdateV2(copyTarget, update)

  editor.update(() => {}, { discrete: true })

  return editor.toJSON().editorState
}
