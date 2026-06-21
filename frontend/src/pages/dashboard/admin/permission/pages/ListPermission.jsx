import { useState, useMemo } from 'react'
import { Save, Loader2, Lock, ShieldOff } from 'lucide-react'
import { useRolesWithPermissions, useUpdateRolePermissions } from '../hooks/usePermission'
import { useHasPermission } from '@/lib/permissions'
import { RoleList } from '../components/role-list/RoleList'
import { PermissionPanel } from '../components/permission-panel/PermissionPanel'

function groupPermissions(perms) {
  const g = {}
  for (const p of perms) {
    const mod = p.name.split('.')[0]
    if (!g[mod]) g[mod] = []
    g[mod].push(p)
  }
  return g
}

export default function ListPermission() {
  const canManage = useHasPermission('permissions.manage')
  const { roles, permissions, loading, refetch } = useRolesWithPermissions({ skip: !canManage })
  const { save, saving } = useUpdateRolePermissions()

  const editableRoles = useMemo(() => roles.filter((r) => r.name !== 'super_admin'), [roles])
  const superAdmin    = useMemo(() => roles.find((r) => r.name === 'super_admin'),   [roles])

  const [activeRoleId, setActiveRoleId] = useState(null)
  const [draft, setDraft]               = useState({})

  const currentRole = useMemo(() => {
    if (activeRoleId) return editableRoles.find((r) => r.id === activeRoleId)
    return editableRoles[0] ?? null
  }, [activeRoleId, editableRoles])

  const currentRoleId = currentRole?.id ?? null

  const checkedIds = useMemo(() => {
    if (!currentRole) return new Set()
    return new Set(draft[currentRoleId] ?? currentRole.permissionIds)
  }, [currentRole, currentRoleId, draft])

  const grouped = useMemo(() => groupPermissions(permissions), [permissions])

  function toggle(permId) {
    if (!canManage) return
    setDraft((prev) => {
      const base = new Set(prev[currentRoleId] ?? currentRole?.permissionIds ?? [])
      base.has(permId) ? base.delete(permId) : base.add(permId)
      return { ...prev, [currentRoleId]: [...base] }
    })
  }

  function toggleModule(permIds, checked) {
    if (!canManage) return
    setDraft((prev) => {
      const base = new Set(prev[currentRoleId] ?? currentRole?.permissionIds ?? [])
      permIds.forEach((id) => (checked ? base.add(id) : base.delete(id)))
      return { ...prev, [currentRoleId]: [...base] }
    })
  }

  async function handleSave() {
    if (!currentRoleId || !canManage) return
    const ids = draft[currentRoleId] ?? currentRole?.permissionIds ?? []
    const ok  = await save(currentRoleId, ids)
    if (ok) {
      setDraft((prev) => { const n = { ...prev }; delete n[currentRoleId]; return n })
      refetch()
    }
  }

  const hasPendingChanges = currentRoleId !== null && draft[currentRoleId] !== undefined
  const totalChecked      = checkedIds.size
  const totalPct          = permissions.length > 0 ? Math.round((totalChecked / permissions.length) * 100) : 0

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <ShieldOff size={40} className="opacity-40" />
        <p className="text-sm">No tienes permisos para visualizar esta sección.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={30} />
      </div>
    )
  }

  return (
    <div className="px-4 pt-2 pb-4 space-y-4">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de permisos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configura qué puede hacer cada rol dentro del sistema</p>
        </div>
        {hasPendingChanges && (
          <button
            onClick={handleSave}
            disabled={saving || !canManage}
            title={!canManage ? 'Sin permiso para gestionar permisos' : undefined}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95
              text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-200 disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar cambios
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Permisos totales',    value: permissions.length,          color: 'text-slate-800'   },
          { label: 'Activos en este rol', value: totalChecked,                 color: 'text-indigo-600'  },
          { label: 'Módulos',             value: Object.keys(grouped).length,  color: 'text-slate-800'   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Aviso super_admin ── */}
      {superAdmin && (
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
          <Lock size={12} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700">
            <strong>Super Admin</strong> tiene acceso total. Sus permisos no son editables.
          </p>
        </div>
      )}

      {/* ── Layout principal ── */}
      <div className="flex gap-4 items-start">
        <RoleList
          roles={editableRoles}
          superAdmin={superAdmin}
          activeRoleId={currentRoleId}
          onRoleSelect={setActiveRoleId}
          draft={draft}
          totalPermissions={permissions.length}
        />
        <PermissionPanel
          grouped={grouped}
          checkedIds={checkedIds}
          currentRole={currentRole}
          totalPct={totalPct}
          hasPendingChanges={hasPendingChanges}
          saving={saving}
          canManage={canManage}
          onToggle={toggle}
          onToggleModule={toggleModule}
          onSave={handleSave}
        />
      </div>

    </div>
  )
}
