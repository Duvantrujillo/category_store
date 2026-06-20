import { useState, useEffect } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateUser, useRoles } from "../../hooks/useUser";

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Input({ error, ...props }) {
  return (
    <input
      {...props}
      className={`w-full h-10 px-3 rounded-lg border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors
        ${error
          ? "border-red-300 bg-red-50 focus:border-red-400"
          : "border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white"
        }`}
    />
  );
}

export default function UserEditDialog({ user, onRefresh, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", roleId: "" });

  const { submitUpdate, loading, errors, clearErrors } = useUpdateUser();
  const { roles, loading: rolesLoading } = useRoles();

  useEffect(() => {
    if (open && user) {
      setForm({ name: user.name ?? "", email: user.email ?? "", roleId: String(user.role?.id ?? "") });
      clearErrors();
    }
  }, [open, user]);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    submitUpdate(user.id, { name: form.name, email: form.email, roleId: form.roleId }, () => {
      onRefresh?.();
      setOpen(false);
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-40 disabled:pointer-events-none"
        disabled={disabled}
        title={disabled ? "Sin permiso para editar usuarios" : undefined}
        onClick={() => setOpen(true)}
      >
        <Pencil size={14} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
                <Pencil size={15} />
              </div>
              Editar usuario
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
            <Field label="Nombre completo" error={errors.name}>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                placeholder="Nombre completo"
              />
            </Field>

            <Field label="Correo electrónico" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                placeholder="correo@ejemplo.com"
              />
            </Field>

            <Field label="Rol" error={errors.roleId}>
              <select
                value={form.roleId}
                onChange={(e) => handleChange("roleId", e.target.value)}
                disabled={rolesLoading}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white transition-colors appearance-none cursor-pointer"
              >
                <option value="" disabled>{rolesLoading ? "Cargando…" : "Selecciona un rol"}</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                  </option>
                ))}
              </select>
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}
                className="rounded-xl h-9 px-4 text-sm" disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}
                className="rounded-xl h-9 px-5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
