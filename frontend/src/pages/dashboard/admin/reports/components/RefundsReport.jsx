import { useRefundsReport } from "../hooks/useReport";
import ReportCard from "./ReportCard";
import { ReportLoader, ReportError } from "./ReportLoader";

const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;

const STATUS_LABELS = { PENDING: "Pendiente", PROCESSED: "Procesado", FAILED: "Fallido" };
const STATUS_CLS    = { PENDING: "text-amber-600", PROCESSED: "text-green-600", FAILED: "text-red-500" };

function RefundsReport({ filters }) {
  const { data, loading, error } = useRefundsReport(filters);

  if (loading) return <ReportLoader />;
  if (error)   return <ReportError message={error} />;
  if (!data)   return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <ReportCard title="Total reembolsos"   value={data.totals.count}             colorClass="text-indigo-600" />
        <ReportCard title="Monto total"        value={fmt(data.totals.amount)}        colorClass="text-violet-600" />
        <ReportCard title="Monto procesado"    value={fmt(data.byStatus.find(s => s.status === "PROCESSED")?.amount ?? 0)} colorClass="text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Por estado */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Por estado</h3>
          <div className="space-y-2">
            {data.byStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0">
                <div>
                  <span className={`text-xs font-medium ${STATUS_CLS[s.status] ?? "text-slate-500"}`}>
                    {STATUS_LABELS[s.status] ?? s.status}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">({s.count})</span>
                </div>
                <span className="font-semibold text-slate-700">{fmt(s.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Por procesador */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Procesados por usuario</h3>
          <div className="space-y-2">
            {data.byProcessor.length > 0 ? data.byProcessor.map((p) => (
              <div key={p.user?.id ?? "unknown"} className="flex items-center justify-between text-sm border-b border-slate-50 pb-1.5 last:border-0">
                <div>
                  <p className="text-xs font-medium text-slate-700">{p.user?.name ?? "Desconocido"}</p>
                  <p className="text-[10px] text-slate-400">{p.user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-indigo-600">{p.count} proc.</p>
                  <p className="text-[10px] text-emerald-600">{fmt(p.amount)}</p>
                </div>
              </div>
            )) : <p className="text-xs text-slate-400">Sin datos de procesador aún.</p>}
          </div>
        </div>
      </div>

      {/* Tabla detalle */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Detalle de reembolsos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                {["Orden","Estado","Monto","Método","Procesado por","Fecha"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.records.map((r) => (
                <tr key={r.id} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-indigo-600">
                    {r.returnRequest?.order?.orderNumber ?? `#${r.returnRequestId}`}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-medium ${STATUS_CLS[r.status] ?? "text-slate-500"}`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">{fmt(r.amount)}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{r.method ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    {r.processedBy
                      ? <div><p className="text-xs font-medium text-slate-700">{r.processedBy.name}</p><p className="text-[10px] text-slate-400">{r.processedBy.email}</p></div>
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

export default RefundsReport;
