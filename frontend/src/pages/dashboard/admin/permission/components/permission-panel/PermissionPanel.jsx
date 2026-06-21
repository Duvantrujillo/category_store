import { Save, Loader2 } from 'lucide-react'
import { ROLE_LABELS } from '../../constants/permissions.constants'
import { PermissionProgressBar } from '../shared/PermissionProgressBar'
import { PermissionModule } from './PermissionModule'

export function PermissionPanel({
  grouped,
  checkedIds,
  currentRole,
  totalPct,
  hasPendingChanges,
  saving,
  canManage,
  onToggle,
  onToggleModule,
  onSave,
}) {
  return (
    <div className="flex-1 min-w-0 space-y-2">

      {/* Barra de cobertura global del rol */}
      {currentRole && (
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700">
              {ROLE_LABELS[currentRole.name] ?? currentRole.name} — cobertura total
            </span>
            <span className="text-xs font-bold text-indigo-600">{totalPct}%</span>
          </div>
          <PermissionProgressBar value={totalPct} color="indigo" />
        </div>
      )}

      {/* Grid 2 columnas para los módulos */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(grouped).map(([module, perms]) => (
          <PermissionModule
            key={module}
            module={module}
            perms={perms}
            checkedIds={checkedIds}
            canManage={canManage}
            onToggle={onToggle}
            onToggleModule={onToggleModule}
          />
        ))}
      </div>

      {hasPendingChanges && (
        <button
          onClick={onSave}
          disabled={saving || !canManage}
          title={!canManage ? 'Sin permiso para gestionar permisos' : undefined}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700
            active:scale-[0.99] text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-100 disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Guardar permisos de {ROLE_LABELS[currentRole?.name] ?? currentRole?.name}
        </button>
      )}
    </div>
  )
}
