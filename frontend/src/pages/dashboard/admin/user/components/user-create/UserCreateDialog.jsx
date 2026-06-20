import { useState } from "react";
import { UserPlus, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateUser, useRoles } from "../../hooks/useUser";

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Input({ error, ...props }) {
  return (
    <input
      {...props}
      className={
        "w-full h-10 px-3 rounded-lg border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors " +
        (error
          ? "border-red-300 bg-red-50 focus:border-red-400"
          : "border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white")
      }
    />
  );
}

export default function UserCreateDialog({ onRefresh, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { form, errors, loading, handleChange, submitCreate, resetForm } = useCreateUser();
  const { roles, loading: rolesLoading } = useRoles();

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitCreate(() => {
      onRefresh?.();
      handleClose();
    });
  };

  return (
    <div style={{ display: "contents" }}>
      <Button
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 h-9 text-sm font-medium shadow-sm disabled:opacity-40 disabled:pointer-events-none"
        disabled={disabled}
        title={disabled ? "Sin permiso para crear usuarios" : undefined}
        onClick={() => setOpen(true)}
      >
        <UserPlus size={15} />
        Nuevo usuario
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
                <UserPlus size={16} />
              </div>
              Registrar nuevo usuario
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
            <Field label="Nombre completo" error={errors.name}>
              <Input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                autoComplete="off"
              />
            </Field>

            <Field label="Correo electrónico" error={errors.email}>
              <Input
                type="email"
                placeholder="usuario@correo.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                autoComplete="off"
              />
            </Field>

            <Field label="Contraseña" error={errors.password}>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  error={errors.password}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            <Field label="Confirmar contraseña" error={errors.confirmPassword}>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repite la contraseña"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            <Field label="Estado inicial" error={errors.status}>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white transition-colors appearance-none cursor-pointer"
              >
                <option value="active">Activo — puede iniciar sesión</option>
                <option value="inactive">Inactivo — acceso suspendido</option>
                <option value="blocked">Bloqueado — acceso denegado</option>
              </select>
            </Field>

            <Field label="Rol" error={errors.roleId}>
              <select
                value={form.roleId}
                onChange={(e) => handleChange("roleId", e.target.value)}
                disabled={rolesLoading}
                className={
                  "w-full h-10 px-3 rounded-lg border text-sm outline-none transition-colors appearance-none cursor-pointer " +
                  (errors.roleId
                    ? "border-red-300 bg-red-50 text-slate-800 focus:border-red-400"
                    : "border-slate-200 bg-slate-50 text-slate-800 focus:border-indigo-400 focus:bg-white")
                }
              >
                <option value="" disabled>
                  {rolesLoading ? "Cargando roles…" : "Selecciona un rol"}
                </option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                    {r.description ? ` — ${r.description}` : ""}
                  </option>
                ))}
              </select>
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="rounded-xl h-9 px-4 text-sm"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || rolesLoading}
                className="rounded-xl h-9 px-5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Registrando…" : "Registrar usuario"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
