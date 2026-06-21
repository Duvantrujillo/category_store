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

      {/* Cabecera */}
      <div className="flex items-center gap-2 px-2.5 py-2 border-b border-slate-100">
        <div className={`flex items-center justify-center w-6 h-6 rounded-md shrink-0 ${colors.icon}`}>
          <Icon size={12} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-semibold text-slate-700 truncate">{cfg.label}</span>
            <span className="text-[10px] text-slate-400 font-medium ml-1 shrink-0">{count}/{permIds.length}</span>
          </div>
          <PermissionProgressBar value={pct} color={cfg.color} />
        </div>
        <div className="ml-1.5 shrink-0">
          <PermissionToggle
            checked={allOn}
            onChange={(v) => onToggleModule(permIds, v)}
            color={cfg.color}
            disabled={!canManage}
          />
        </div>
      </div>

      {/* Lista de permisos en 1 columna */}
      <div className="divide-y divide-slate-50">
        {perms.map((perm) => {
          const on = checkedIds.has(perm.id)
          return (
            <div
              key={perm.id}
              onClick={() => canManage && onToggle(perm.id)}
              className={`flex items-center gap-2 px-2.5 py-1 hover:bg-slate-50 transition-colors group
                ${canManage ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-medium leading-tight transition-colors ${on ? 'text-slate-800' : 'text-slate-400'}`}>
                  {perm.description}
                </p>
                <p className="text-[9px] text-slate-300 font-mono group-hover:text-slate-400 transition-colors truncate">
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
