const TRACK_COLORS = {
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  blue:   'bg-blue-500',
  cyan:   'bg-cyan-500',
  orange: 'bg-orange-500',
  pink:   'bg-pink-500',
  amber:  'bg-amber-500',
}

export function PermissionToggle({ checked, onChange, color = 'indigo', disabled = false }) {
  const track = TRACK_COLORS[color] ?? 'bg-indigo-500'
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onChange(!checked) }}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
        disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
        ${checked ? track : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200
        ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  )
}
