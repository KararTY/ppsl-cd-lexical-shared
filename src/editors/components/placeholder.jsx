export function Placeholder ({ children }) {
  return (
    <div className="pointer-events-none absolute left-0 top-0 select-none overflow-hidden text-ellipsis p-3">
      {children}
    </div>
  )
}
