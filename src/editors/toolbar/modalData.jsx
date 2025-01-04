export function resetEditorModalContent (setModal) {
  return {
    title: 'Reset content',
    children: <p>Are you sure you want to clear the editor?</p>,
    onConfirm: () => {
      globalThis._persistence.clearData()
      window.location.reload()
    },
    onClose: () => setModal(null)
  }
}
