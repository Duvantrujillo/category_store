import { KeyRound } from 'lucide-react'
import { MODULE_CONFIG, MODULE_COLORS } from '../../constants/permissions.constants'
import { PermissionToggle } from '../shared/PermissionToggle'
import { PermissionProgressBar } from '../shared/PermissionProgressBar'

export function PermissionModule({ module, perms, checkedIds, canManage, onToggle, onToggleModule }) {
  const cfg     = MODULE_CONFIG[module] ?? { label: module, icon: KeyRound, color: 'indigo' }
  const colors  = MODULE_COLORS[cfg.color] ?? MODULE_COLORS.indigo
  const Icon    = cfg.icon
  const permIds = perms.map((p) => p.id)
  const count   = permIds.filter((id) => checkedIds.has(id)).length
  const allOn   = count === permIds.length
  const pct     = permIds.length > 0 ? (count / permIds.length) * 100 : 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

      {/* Cabecera compacta */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-slate-100">
        <div className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${colors.icon}`}>
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700">{cfg.label}</span>
            <span className="text-[10px] text-slate-400 font-medium">{count}/{permIds.length}</span>
          </div>
          <PermissionProgressBar value={pct} color={cfg.color} />
        </div>
        <div className="ml-2 shrink-0">
          <PermissionToggle
            checked={allOn}
            onChange={(v) => onToggleModule(permIds, v)}
            color={cfg.color}
            disabled={!canManage}
          />
        </div>
      </div>

      {/* Grid de 2 columnas para los permisos */}
      <div className="grid grid-cols-2">
        {perms.map((perm, i) => {
          const on = checkedIds.has(perm.id)
          const isLeftCol = i % 2 === 0
          return (
            <div
              key={perm.id}
              onClick={() => canManage && onToggle(perm.id)}
              className={`flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 transition-colors
                border-b border-slate-50 group
                ${isLeftCol ? 'border-r border-slate-100' : ''}
                ${canManage ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium leading-tight transition-colors ${on ? 'text-slate-800' : 'text-slate-400'}`}>
                  {perm.description}
                </p>
                <p className="text-[10px] text-slate-300 font-mono mt-0.5 group-hover:text-slate-400 transition-colors truncate">
                  {perm.name}
                </p>
              </div>
              <PermissionToggle
                checked={on}
                onChange={() => onToggle(perm.id)}
                color={cfg.color}
                disabled={!canManage}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
