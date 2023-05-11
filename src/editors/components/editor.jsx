import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

export function Editor ({ children, onSubmit, editorRef, ...restProps }) {
  const [editor] = useLexicalComposerContext()

  const onSubmitCatch = (event) => {
    onSubmit({ event, editor })
  }

  useEffect(() => {
    if (!editorRef) return

    editorRef.current = editor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  return (
    <form onSubmit={onSubmitCatch} className="m-0" {...restProps}>
      {children}
    </form>
  )
}
