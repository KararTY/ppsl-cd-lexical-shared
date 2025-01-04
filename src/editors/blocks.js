import * as lexicalSelection from '@lexical/selection'

const { $isAtNodeEnd } = lexicalSelection

export const blockTypeToBlockName = {
  paragraph: 'Normal',
  quote: 'Quote'
}

export function getSelectedNode (selection) {
  const anchor = selection.anchor
  const focus = selection.focus
  const anchorNode = selection.anchor.getNode()
  const focusNode = selection.focus.getNode()
  if (anchorNode === focusNode) {
    return anchorNode
  }
  const isBackward = selection.isBackward()
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode
  }
}
