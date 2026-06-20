import { ShieldCheck, Lock } from 'lucide-react'
import { ROLE_LABELS } from '../../constants/permissions.constants'
import { PermissionProgressBar } from '../shared/PermissionProgressBar'

export function RoleList({ roles, superAdmin, activeRoleId, onRoleSelect, draft, totalPermissions }) {
  return (
    <div className="w-52 shrink-0 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 px-1 mb-3">Roles</p>

      {roles.map((role) => {
        const isActive  = role.id === activeRoleId
        const isPending = draft[role.id] !== undefined
        const count     = new Set(draft[role.id] ?? role.permissionIds).size
        const pct       = totalPermissions > 0 ? (count / totalPermissions) * 100 : 0

        return (
          <button
            key={role.id}
            onClick={() => onRoleSelect(role.id)}
            className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150
              ${isActive
                ? 'bg-indigo-50 border-indigo-200 shadow-sm shadow-indigo-100'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className={isActive ? 'text-indigo-500' : 'text-slate-400'} />
              <span className={`text-sm font-semibold ${isActive ? 'text-indigo-800' : 'text-slate-600'}`}>
                {ROLE_LABELS[role.name] ?? role.name}
              </span>
              {isPending && (
                <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
              )}
            </div>

            <div className="mt-2 ml-5">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] ${isActive ? 'text-indigo-500' : 'text-slate-400'}`}>
                  {count}/{totalPermissions}
                </span>
                <span className={`text-[11px] font-semibold ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {Math.round(pct)}%
                </span>
              </div>
              <PermissionProgressBar value={pct} color="indigo" />
            </div>
          </button>
        )
      })}

      {superAdmin && (
        <div className="px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 opacity-60">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-500">
              {ROLE_LABELS[superAdmin.name] ?? superAdmin.name}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 ml-5">Acceso total</p>
        </div>
      )}
    </div>
  )
}
