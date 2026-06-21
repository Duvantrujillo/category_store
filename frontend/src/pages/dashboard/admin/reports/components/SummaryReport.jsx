import { ShoppingCart, DollarSign, RotateCcw, Wallet, Package, ArrowRight } from "lucide-react";

import { useSummaryReport } from "../hooks/useReport";
import ReportCard            from "./ReportCard";
import ReportSection         from "./ReportSection";
import { ReportLoader, ReportError } from "./ReportLoader";
import DonutChart from "./charts/DonutChart";
import HBar       from "./charts/HBar";

const fmtCOP = (n) => `$${Number(n).toLocaleString("es-CO")}`;

const ORDER_SEGMENTS = [
  { key: "paid",      label: "Pagadas",    color: "#10b981" },
  { key: "cancelled", label: "Canceladas", color: "#f43f5e" },
  { key: "other",     label: "Otras",      color: "#94a3b8" },
];

const SHIPMENT_PIPELINE = [
  { status: "CREATED",   label: "Creado",     cls: "bg-slate-100 text-slate-600  border-slate-200" },
  { status: "PREPARING", label: "Preparando", cls: "bg-amber-50  text-amber-700  border-amber-200" },
  { status: "SHIPPED",   label: "Enviado",    cls: "bg-blue-50   text-blue-700   border-blue-200"  },
  { status: "DELIVERED", label: "Entregado",  cls: "bg-green-50  text-green-700  border-green-200" },
  { status: "RETURNED",  label: "Devuelto",   cls: "bg-red-50    text-red-700    border-red-200"   },
];

function SummaryReport({ filters }) {
  const { data, loading, error } = useSummaryReport(filters);

  if (loading) return <ReportLoader />;
  if (error)   return <ReportError message={error} />;
  if (!data)   return null;

  const other = Math.max(0, data.orders.total - data.orders.paid - data.orders.cancelled);
  const orderValues = { paid: data.orders.paid, cancelled: data.orders.cancelled, other };
  const donutSegments = ORDER_SEGMENTS.map((s) => ({ ...s, value: orderValues[s.key] })).filter((s) => s.value > 0);

  const maxQty = Math.max(...data.topProducts.map((p) => p.quantity), 1);

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ReportCard
          title="Total órdenes"
          value={data.orders.total}
          sub={`${data.orders.paid} pagadas`}
          icon={ShoppingCart}
          colorClass="text-indigo-600"
          accent="bg-indigo-400"
        />
        <ReportCard
          title="Ingresos totales"
          value={fmtCOP(data.orders.revenue)}
          sub={`Ticket prom. ${fmtCOP(data.orders.total > 0 ? data.orders.revenue / data.orders.total : 0)}`}
          icon={DollarSign}
          colorClass="text-emerald-600"
          accent="bg-emerald-400"
        />
        <ReportCard
          title="Devoluciones"
          value={data.returns.total}
          sub={`${data.returns.pending} pendientes`}
          icon={RotateCcw}
          colorClass="text-amber-600"
          accent="bg-amber-400"
        />
        <ReportCard
          title="Reembolsado"
          value={fmtCOP(data.refunds.processedAmount)}
          sub={`${data.refunds.processed} procesados`}
          icon={Wallet}
          colorClass="text-violet-600"
          accent="bg-violet-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Distribución de órdenes - donut */}
        <ReportSection title="Distribución de órdenes" icon={ShoppingCart}>
          <div className="flex flex-col items-center gap-5 py-2">
            <DonutChart
              segments={donutSegments}
              size={148}
              thickness={20}
              centerLabel={data.orders.total}
              centerSub="órdenes"
            />
            <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center">
              {donutSegments.map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-slate-500">{s.label}</span>
                  <span className="text-xs font-bold text-slate-800 tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ReportSection>

        {/* Pipeline de envíos */}
        <ReportSection title="Estado de envíos" icon={Package}>
          <div className="space-y-2.5">
            {SHIPMENT_PIPELINE.map((stage, i) => {
              const found = data.shipments.find((s) => s.status === stage.status);
              const count = found?.count ?? 0;
              const total = data.shipments.reduce((acc, s) => acc + (s.count || 0), 0) || 1;
              const pct   = Math.round((count / total) * 100);
              return (
                <div key={stage.status} className="space-y-1">
                  <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border ${stage.cls}`}>
                    <div className="flex items-center gap-2">
                      {i < 4 && <ArrowRight size={12} className="opacity-40" />}
                      <span className="text-xs font-semibold">{stage.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1 bg-black/10 rounded-full overflow-hidden">
                        <div className="h-full bg-current rounded-full opacity-40" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm font-bold tabular-nums w-6 text-right">{count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ReportSection>
      </div>

      {/* Top productos */}
      {data.topProducts.length > 0 && (
        <ReportSection title="Top 5 productos más vendidos" icon={Package}>
          <div className="space-y-0.5">
            {data.topProducts.map((p, i) => (
              <HBar
                key={p.name}
                rank={i + 1}
                label={p.name}
                value={p.quantity}
                max={maxQty}
                displayValue={`${p.quantity} uds · ${fmtCOP(p.revenue)}`}
                color="#6366f1"
              />
            ))}
          </div>
        </ReportSection>
      )}
    </div>
  );
}

export default SummaryReport;
