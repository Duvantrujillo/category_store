import { useState } from "react";
import { KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useResetPassword } from "../../hooks/useUser";

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function UserResetPasswordDialog({ user, onRefresh, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { form, errors, loading, handleChange, submitReset, resetForm } = useResetPassword();

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitReset(user.id, () => {
      onRefresh?.();
      handleClose();
    });
  };

  const inputClass = (hasError) =>
    "w-full h-10 px-3 pr-10 rounded-lg border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors " +
    (hasError
      ? "border-red-300 bg-red-50 focus:border-red-400"
      : "border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white");

  return (
    <div style={{ display: "contents" }}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 disabled:opacity-40 disabled:pointer-events-none"
        disabled={disabled}
        title={disabled ? "Sin permiso para restablecer contraseña" : undefined}
        onClick={() => setOpen(true)}
      >
        <KeyRound size={14} />
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600">
                <KeyRound size={15} />
              </div>
              Restablecer contraseña
            </DialogTitle>
            <p className="text-xs text-slate-400 mt-1 pl-10">
              {user.name} · {user.email}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
            <Field label="Nueva contraseña" error={errors.newPassword}>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className={inputClass(errors.newPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>

            <Field label="Confirmar contraseña" error={errors.confirmPassword}>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                  className={inputClass(errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
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
                disabled={loading}
                className="rounded-xl h-9 px-5 text-sm bg-amber-500 hover:bg-amber-600 text-white font-medium flex items-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Restableciendo…" : "Restablecer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
