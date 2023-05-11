/**
 * @param {any} theme
 * @param {boolean} readOnly
 * @returns {import("@lexical/react/LexicalComposer").InitialConfigType}
 */
export const bioConfig = (theme, editable) => ({
  // The editor theme
  theme,
  // Handling of errors during update
  onError (error) {
    throw error
  },
  // Any custom nodes go here
  nodes: [],
  // **INITIAL** state.
  editable
})
