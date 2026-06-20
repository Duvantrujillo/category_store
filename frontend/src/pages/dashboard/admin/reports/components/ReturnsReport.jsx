import { useReturnsReport } from "../hooks/useReport";
import ReportCard from "./ReportCard";
import { ReportLoader, ReportError } from "./ReportLoader";

const STATUS_LABELS = {
  PENDING:   "Pendiente",
  APPROVED:  "Aprobada",
  REJECTED:  "Rechazada",
  RECEIVED:  "Recibida",
  COMPLETED: "Completada",
};
const STATUS_CLS = {
  PENDING:   "text-amber-600",
  APPROVED:  "text-blue-600",
  REJECTED:  "text-red-500",
  RECEIVED:  "text-violet-600",
  COMPLETED: "text-green-600",
};
const RES_LABELS = { REFUND: "Reembolso", EXCHANGE: "Cambio", STORE_CREDIT: "Crédito tienda" };

function ReturnsReport({ filters }) {
  const { data, loading, error } = useReturnsReport(filters);

  if (loading) return <ReportLoader />;
  if (error)   return <ReportError message={error} />;
  if (!data)   return null;

  return (
    <div className="space-y-5">
      {/* Por estado */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {data.byStatus.map((s) => (
          <ReportCard
            key={s.status}
            title={STATUS_LABELS[s.status] ?? s.status}
            value={s.count}
            colorClass={STATUS_CLS[s.status] ?? "text-slate-600"}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Por resolución */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Por tipo de resolución</h3>
          <div className="space-y-2">
            {data.byResolution.map((r) => (
              <div key={r.resolution} className="flex items-center justify-between text-sm border-b border-slate-50 pb-1.5 last:border-0">
                <span className="text-slate-600">{RES_LABELS[r.resolution] ?? r.resolution}</span>
                <span className="font-bold text-indigo-600">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Por usuario que registró */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Registros por usuario</h3>
          <div className="space-y-2">
            {data.byUser.length > 0 ? data.byUser.map((u) => (
              <div key={u.user?.id ?? "unknown"} className="flex items-center justify-between text-sm border-b border-slate-50 pb-1.5 last:border-0">
                <div>
                  <p className="font-medium text-slate-700">{u.user?.name ?? "Desconocido"}</p>
                  <p className="text-xs text-slate-400">{u.user?.email}</p>
                </div>
                <span className="font-bold text-indigo-600">{u.count}</span>
              </div>
            )) : <p className="text-xs text-slate-400">Sin datos de usuario aún.</p>}
          </div>
        </div>
      </div>

      {/* Tabla de registros */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Detalle de solicitudes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                {["Orden","Estado","Resolución","Registrado por","Aprobado por","Fecha"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.records.map((r) => (
                <tr key={r.id} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-indigo-600">{r.order?.orderNumber}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-medium ${STATUS_CLS[r.status] ?? "text-slate-500"}`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{RES_LABELS[r.resolution] ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    {r.registeredBy
                      ? <div><p className="text-xs font-medium text-slate-700">{r.registeredBy.name}</p><p className="text-[10px] text-slate-400">{r.registeredBy.email}</p></div>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    {r.approvedBy
                      ? <div><p className="text-xs font-medium text-slate-700">{r.approvedBy.name}</p><p className="text-[10px] text-slate-400">{r.approvedBy.email}</p></div>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString("es-CO")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReturnsReport;
