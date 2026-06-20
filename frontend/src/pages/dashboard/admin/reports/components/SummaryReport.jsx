import { useSummaryReport } from "../hooks/useReport";
import ReportCard from "./ReportCard";
import { ReportLoader, ReportError } from "./ReportLoader";

const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;

const STATUS_LABELS = {
  CREATED:   "Creado",
  PREPARING: "Preparando",
  SHIPPED:   "Enviado",
  DELIVERED: "Entregado",
  RETURNED:  "Devuelto",
};

function SummaryReport({ filters }) {
  const { data, loading, error } = useSummaryReport(filters);

  if (loading) return <ReportLoader />;
  if (error)   return <ReportError message={error} />;
  if (!data)   return null;

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ReportCard title="Total órdenes"   value={data.orders.total}   />
        <ReportCard title="Órdenes pagadas" value={data.orders.paid}    colorClass="text-green-600" />
        <ReportCard title="Ingresos totales" value={fmt(data.orders.revenue)} colorClass="text-emerald-600" />
        <ReportCard title="Órdenes canceladas" value={data.orders.cancelled} colorClass="text-red-500" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ReportCard title="Devoluciones"        value={data.returns.total}               colorClass="text-amber-600" />
        <ReportCard title="Devoluciones pendientes" value={data.returns.pending}         colorClass="text-orange-500" />
        <ReportCard title="Reembolsos procesados"   value={data.refunds.processed}       colorClass="text-blue-600" />
        <ReportCard title="Monto reembolsado"  value={fmt(data.refunds.processedAmount)} colorClass="text-violet-600" />
      </div>

      {/* Envíos por estado */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Estado de envíos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {data.shipments.map((s) => (
            <div key={s.status} className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-lg font-bold text-slate-800">{s.count}</p>
              <p className="text-xs text-slate-500">{STATUS_LABELS[s.status] ?? s.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top productos */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Top 5 productos más vendidos</h3>
        <div className="space-y-2">
          {data.topProducts.map((p, i) => (
            <div key={p.name} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                <span className="font-medium text-slate-700">{p.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>{p.quantity} uds.</span>
                <span className="font-semibold text-emerald-600">{fmt(p.revenue)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SummaryReport;
