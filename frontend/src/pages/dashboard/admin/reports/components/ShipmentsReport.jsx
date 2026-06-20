import { useShipmentsReport } from "../hooks/useReport";
import ReportCard from "./ReportCard";
import { ReportLoader, ReportError } from "./ReportLoader";

const STATUS_LABELS = {
  CREATED:   "Creado",
  PREPARING: "Preparando",
  SHIPPED:   "Enviado",
  DELIVERED: "Entregado",
  RETURNED:  "Devuelto",
};
const STATUS_CLS = {
  CREATED:   "text-slate-600",
  PREPARING: "text-amber-600",
  SHIPPED:   "text-blue-600",
  DELIVERED: "text-green-600",
  RETURNED:  "text-red-500",
};

function ShipmentsReport({ filters }) {
  const { data, loading, error } = useShipmentsReport(filters);

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
        {/* Por transportista */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Por transportista</h3>
          {data.byCarrier.length > 0 ? (
            <div className="space-y-2">
              {data.byCarrier.map((c) => (
                <div key={c.carrier} className="flex items-center justify-between text-sm border-b border-slate-50 pb-1.5 last:border-0">
                  <span className="text-slate-600 capitalize">{c.carrier?.toLowerCase()}</span>
                  <span className="font-bold text-indigo-600">{c.count}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-slate-400">Sin transportista asignado aún.</p>}
        </div>

        {/* Por operador */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Operadores más activos</h3>
          {data.byOperator.length > 0 ? (
            <div className="space-y-2">
              {data.byOperator.map((o) => (
                <div key={o.user?.id ?? "unknown"} className="flex items-center justify-between text-sm border-b border-slate-50 pb-1.5 last:border-0">
                  <div>
                    <p className="text-xs font-medium text-slate-700">{o.user?.name ?? "Desconocido"}</p>
                    <p className="text-[10px] text-slate-400">{o.user?.email}</p>
                  </div>
                  <span className="font-bold text-indigo-600">{o.count} cambios</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-slate-400">Sin datos de operador aún.</p>}
        </div>
      </div>

      {/* Tabla de envíos */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Detalle de envíos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                {["Orden","Cliente","Estado","Transportista","Tracking","Cambios","Fecha"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.records.map((s) => (
                <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-indigo-600">{s.order?.orderNumber}</td>
                  <td className="px-4 py-2.5 text-slate-700">{s.order?.firstName} {s.order?.lastName}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-medium ${STATUS_CLS[s.status] ?? "text-slate-500"}`}>
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs capitalize">{s.carrier?.toLowerCase() ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{s.trackingNumber ?? "—"}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="text-xs font-bold text-slate-700">{s.history?.length ?? 0}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{new Date(s.createdAt).toLocaleDateString("es-CO")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ShipmentsReport;
