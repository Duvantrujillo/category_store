import { useState, useMemo, useRef, useEffect } from "react";
import { Inbox, ChevronDown, Users, ShieldCheck, UserCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import TablePagination from "@/components/ui/TablePagination";
import { useUpdateUserStatus } from "../../hooks/useUser";
import UserEditDialog from "../user-edit/UserEditDialog";
import UserResetPasswordDialog from "../user-reset-password/UserResetPasswordDialog";
import { useHasPermission } from "@/lib/permissions";

const ROLE_STYLE = {
  admin:       "bg-indigo-50 text-indigo-700 border-indigo-200",
  customer:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  super_admin: "bg-violet-50 text-violet-700 border-violet-200",
};

const STATUS_CONFIG = {
  active:   { label: "Activo",    dot: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200" },
  inactive: { label: "Inactivo",  dot: "bg-slate-400",  badge: "bg-slate-100 text-slate-500 border-slate-200" },
  blocked:  { label: "Bloqueado", dot: "bg-red-500",    badge: "bg-red-50 text-red-600 border-red-200" },
};

const STATUS_OPTIONS = [
  { value: "active",   label: "Activo" },
  { value: "inactive", label: "Inactivo" },
  { value: "blocked",  label: "Bloqueado" },
];

const ROLE_TABS = [
  { key: "all",         label: "Todos",       icon: Users },
  { key: "super_admin", label: "Super Admin",  icon: ShieldAlert },
  { key: "admin",       label: "Admin",        icon: ShieldCheck },
  { key: "customer",    label: "Clientes",     icon: UserCheck },
];

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function StatusDropdown({ userId, current, onRefresh, canUpdate }) {
  const [open, setOpen]   = useState(false);
  const [pos, setPos]     = useState({ top: 0, left: 0 });
  const btnRef            = useRef(null);
  const { changeStatus, loading } = useUpdateUserStatus();
  const cfg = STATUS_CONFIG[current] ?? STATUS_CONFIG.active;

  const handleOpen = () => {
    if (!canUpdate) return;
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen((v) => !v);
  };

  // Recalcular si el usuario hace scroll mientras está abierto
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        setPos({ top: rect.bottom + 6, left: rect.left });
      }
    };
    window.addEventListener("scroll", update, true);
    return () => window.removeEventListener("scroll", update, true);
  }, [open]);

  const handleSelect = async (value) => {
    if (value === current) { setOpen(false); return; }
    setOpen(false);
    await changeStatus(userId, value, onRefresh);
  };

  return (
    <div className="inline-block">
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={loading || !canUpdate}
        title={!canUpdate ? "Sin permiso para cambiar estado" : undefined}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border select-none transition-opacity ${cfg.badge} ${!canUpdate ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:opacity-80"} ${loading ? "opacity-50" : ""}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        {cfg.label}
        <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 w-36 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden py-1"
            style={{ top: pos.top, left: pos.left }}
          >
            {STATUS_OPTIONS.map((opt) => {
              const c = STATUS_CONFIG[opt.value];
              return (
                <button key={opt.value} onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-slate-50 ${opt.value === current ? "font-semibold text-slate-800" : "text-slate-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                  {c.label}
                  {opt.value === current && <span className="ml-auto text-indigo-500">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function UserTable({ users, allUsers = [], totalItems, page, pageSize, onPageChange, onRefresh, activeRole, onRoleChange }) {
  const canUpdate = useHasPermission("admins.update");
  // Los contadores se calculan sobre el total, no sobre la página actual
  const counts = useMemo(() => ({
    all:         allUsers.length,
    super_admin: allUsers.filter((u) => u.role?.name === "super_admin").length,
    admin:       allUsers.filter((u) => u.role?.name === "admin").length,
    customer:    allUsers.filter((u) => u.role?.name === "customer").length,
  }), [allUsers]);

  return (
    <Card className="rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base font-semibold text-slate-800">
            Usuarios registrados
          </CardTitle>

          {/* Tabs de filtro por rol */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {ROLE_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onRoleChange(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeRole === key
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon size={12} />
                {label}
                <span className={`ml-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  activeRole === key ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"
                }`}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {users.length > 0 ? (
          <>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    {["Usuario", "Correo electrónico", "Rol", "Estado", "Acciones"].map((h) => (
                      <TableHead key={h}
                        className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 whitespace-nowrap">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50/60 transition-colors group">

                      {/* Avatar + nombre */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 text-white text-xs font-bold select-none">
                              {getInitials(user.name)}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                              STATUS_CONFIG[user.status]?.dot ?? "bg-green-500"
                            }`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="px-4 py-3 text-sm text-slate-500 max-w-[220px] truncate">
                        {user.email}
                      </TableCell>

                      {/* Rol */}
                      <TableCell className="px-4 py-3">
                        {user.role?.name ? (
                          <Badge variant="outline"
                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border capitalize ${
                              ROLE_STYLE[user.role.name] ?? "bg-slate-50 text-slate-600 border-slate-200"
                            }`}>
                            {user.role.name}
                          </Badge>
                        ) : <span className="text-xs text-slate-400">—</span>}
                      </TableCell>

                      {/* Estado */}
                      <TableCell className="px-4 py-3">
                        <StatusDropdown userId={user.id} current={user.status ?? "active"} onRefresh={onRefresh} canUpdate={canUpdate} />
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <UserEditDialog
                            user={user}
                            onRefresh={onRefresh}
                            disabled={!canUpdate}
                          />
                          <UserResetPasswordDialog
                            user={user}
                            onRefresh={onRefresh}
                            disabled={!canUpdate}
                          />
                        </div>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <TablePagination
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={onPageChange}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <Inbox size={36} strokeWidth={1.2} />
            <p className="text-sm">
              {activeRole === "all" ? "No hay usuarios registrados" : `No hay usuarios con rol "${activeRole.replace("_", " ")}"`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UserTable;
