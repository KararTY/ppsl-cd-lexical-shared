/**
 * @param {Error} error
 * @returns {void}
 */
const onErrorDefault = (error) => {
  throw error
}

/**
 * @param {any} theme
 * @param {boolean} editable
 * @param {any} editorState
 * @param {typeof onErrorDefault} onError
 * @returns {import("@lexical/react/LexicalComposer").InitialConfigType}
 */
export const bioConfig = (
  theme,
  editable,
  editorState,
  onError = onErrorDefault
) => ({
  // The editor theme
  theme,
  // Handling of errors during update
  onError,
  // Any custom nodes go here
  nodes: [],
  editable,
  // **INITIAL** state.
  editorState
})
