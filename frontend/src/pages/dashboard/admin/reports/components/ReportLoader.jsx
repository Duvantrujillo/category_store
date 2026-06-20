import { Loader2, AlertCircle } from "lucide-react";

export function ReportLoader() {
  return (
    <div className="flex items-center justify-center h-40 text-slate-400 gap-2">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-sm">Cargando reporte...</span>
    </div>
  );
}

export function ReportError({ message }) {
  return (
    <div className="flex items-center justify-center h-40 text-red-500 gap-2">
      <AlertCircle size={18} />
      <span className="text-sm">{message}</span>
    </div>
  );
}
