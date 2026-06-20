const BAR_COLORS = {
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  blue:   'bg-blue-500',
  cyan:   'bg-cyan-500',
  orange: 'bg-orange-500',
  pink:   'bg-pink-500',
  amber:  'bg-amber-500',
}

export function PermissionProgressBar({ value, color = 'indigo' }) {
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${BAR_COLORS[color] ?? 'bg-indigo-500'}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
