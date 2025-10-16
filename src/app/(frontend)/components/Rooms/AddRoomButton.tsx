export type AddButtonProps = {
  label: string
  onClick?: () => void
}

export default function AddButton({ label, onClick }: AddButtonProps) {
  return (
    <button type="button" className="bg-zinc-200 hover:bg-blue-200 py-1 px-2 rounded-lg" onClick={onClick}>
      ＋ {label}
    </button>
  )
}