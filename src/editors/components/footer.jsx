import { Button } from '@/components/Button'

export function EditorFooter ({ isSaving, text = 'Save' }) {
  return (
    <footer className="m-0 flex items-center  justify-end gap-2 p-3">
      {isSaving && <progress className="m-0" />}
      <Button type="submit" className="w-auto p-1 px-2">
        {text}
      </Button>
    </footer>
  )
}
