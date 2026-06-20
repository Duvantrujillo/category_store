import { useSalesReport } from "../hooks/useReport";
import ReportCard from "./ReportCard";
import { ReportLoader, ReportError } from "./ReportLoader";

const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;

const STATUS_LABELS = { PAID: "Pagada", PENDING: "Pendiente", CANCELLED: "Cancelada", REFUNDED: "Reembolsada" };
const STATUS_CLS    = { PAID: "text-green-600", PENDING: "text-amber-600", CANCELLED: "text-red-500", REFUNDED: "text-violet-600" };

function SalesReport({ filters }) {
  const { data, loading, error } = useSalesReport(filters);

  if (loading) return <ReportLoader />;
  if (error)   return <ReportError message={error} />;
  if (!data)   return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <ReportCard title="Órdenes pagadas"   value={data.revenue.count}         colorClass="text-indigo-600" />
        <ReportCard title="Ingresos totales"  value={fmt(data.revenue.total)}    colorClass="text-emerald-600" />
        <ReportCard title="Ticket promedio"   value={fmt(data.revenue.average)}  colorClass="text-blue-600" />
      </div>

      {/* Por estado */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Órdenes por estado</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {data.byStatus.map((s) => (
            <div key={s.status} className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className={`text-xl font-bold ${STATUS_CLS[s.status] ?? "text-slate-700"}`}>{s.count}</p>
              <p className="text-xs text-slate-500">{STATUS_LABELS[s.status] ?? s.status}</p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">{fmt(s.total)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top productos por ingreso */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Top 10 productos por ingresos</h3>
        <div className="space-y-1">
          {data.topProducts.map((p, i) => (
            <div key={p.name} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                <span className="font-medium text-slate-700">{p.name}</span>
              </div>
              <div className="flex items-center gap-5 text-xs text-slate-500">
                <span>{p.quantity} uds.</span>
                <span className="font-semibold text-emerald-600 w-28 text-right">{fmt(p.revenue)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de órdenes */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Detalle de órdenes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                {["Orden","Cliente","Estado","Total","Fecha"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.records.map((o) => (
                <tr key={o.id} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs font-medium text-indigo-600">{o.orderNumber}</td>
                  <td className="px-4 py-2.5 text-slate-700">{o.firstName} {o.lastName}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-medium ${STATUS_CLS[o.status] ?? "text-slate-500"}`}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">{fmt(o.total)}</td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{new Date(o.createdAt).toLocaleDateString("es-CO")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SalesReport;
