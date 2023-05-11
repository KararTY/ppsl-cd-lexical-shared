import { useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { TreeView } from '@lexical/react/LexicalTreeView'

export const TreeViewPlugin = () => {
  const [editor] = useLexicalComposerContext()

  const [hidden, setHidden] = useState(true)

  return (
    <div>
      <button
        type="button"
        className="flex border-0 p-0 text-xs text-blue-500 ring-0"
        onClick={() => setHidden(!hidden)}
      >
        Toggle debug
      </button>
      <TreeView
        viewClassName={hidden ? 'hidden' : ''}
        treeTypeButtonClassName="text-black dark:text-white"
        timeTravelButtonClassName="text-black dark:text-white"
        editor={editor}
      />
    </div>
  )
}
