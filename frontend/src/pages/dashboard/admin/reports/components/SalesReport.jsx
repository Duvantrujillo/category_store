import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Receipt, ShoppingBag } from "lucide-react";

import { useSalesReport } from "../hooks/useReport";
import ReportCard         from "./ReportCard";
import ReportSection      from "./ReportSection";
import { ReportLoader, ReportError } from "./ReportLoader";
import TablePagination    from "@/components/ui/TablePagination";
import VBarChart from "./charts/VBarChart";
import HBar      from "./charts/HBar";

const PAGE_SIZE = 15;

const fmtCOP = (n) => `$${Number(n).toLocaleString("es-CO")}`;

const STATUS_META = {
  PAID:      { label: "Pagada",      color: "#10b981", badge: "bg-green-50  text-green-700  ring-green-200"  },
  PENDING:   { label: "Pendiente",   color: "#f59e0b", badge: "bg-amber-50  text-amber-700  ring-amber-200"  },
  CANCELLED: { label: "Cancelada",   color: "#f43f5e", badge: "bg-red-50    text-red-700    ring-red-200"    },
  REFUNDED:  { label: "Reembolsada", color: "#8b5cf6", badge: "bg-violet-50 text-violet-700 ring-violet-200" },
};

function SalesReport({ filters }) {
  const { data, loading, error } = useSalesReport(filters);
  const [page, setPage] = useState(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setPage(1), [JSON.stringify(filters)]);

  if (loading) return <ReportLoader />;
  if (error)   return <ReportError message={error} />;
  if (!data)   return null;

  const pagedRecords = data.records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const barData   = data.byStatus.map((s) => ({
    label: STATUS_META[s.status]?.label ?? s.status,
    value: s.count,
    color: STATUS_META[s.status]?.color ?? "#94a3b8",
  }));
  const maxRev    = Math.max(...data.topProducts.map((p) => p.revenue), 1);

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ReportCard
          title="Órdenes pagadas"
          value={data.revenue.count}
          icon={Receipt}
          colorClass="text-indigo-600"
          accent="bg-indigo-400"
        />
        <ReportCard
          title="Ingresos totales"
          value={fmtCOP(data.revenue.total)}
          icon={DollarSign}
          colorClass="text-emerald-600"
          accent="bg-emerald-400"
        />
        <ReportCard
          title="Ticket promedio"
          value={fmtCOP(data.revenue.average)}
          icon={TrendingUp}
          colorClass="text-blue-600"
          accent="bg-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Gráfica de barras: órdenes por estado */}
        <ReportSection title="Órdenes por estado" icon={ShoppingBag}>
          <VBarChart data={barData} height={160} />
          <div className="mt-4 space-y-2 pt-3 border-t border-slate-100">
            {data.byStatus.map((s) => {
              const meta = STATUS_META[s.status];
              return (
                <div key={s.status} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: meta?.color }} />
                    <span className="text-slate-600">{meta?.label ?? s.status}</span>
                    <span className="font-bold text-slate-800 tabular-nums">{s.count}</span>
                  </div>
                  <span className="font-semibold text-slate-500 tabular-nums">{fmtCOP(s.total)}</span>
                </div>
              );
            })}
          </div>
        </ReportSection>

        {/* Top 10 productos por ingresos */}
        <ReportSection title="Top 10 productos · ingresos" icon={TrendingUp}>
          <div className="space-y-0.5">
            {data.topProducts.map((p, i) => (
              <HBar
                key={p.name}
                rank={i + 1}
                label={p.name}
                value={p.revenue}
                max={maxRev}
                displayValue={fmtCOP(p.revenue)}
                color="#10b981"
              />
            ))}
          </div>
        </ReportSection>
      </div>

      {/* Tabla detalle órdenes */}
      <ReportSection title="Detalle de órdenes" icon={Receipt} noPad>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                {["Orden", "Cliente", "Estado", "Total", "Fecha"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pagedRecords.map((o) => {
                const meta = STATUS_META[o.status];
                return (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3 font-mono text-[11px] font-semibold text-indigo-600">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-slate-700 font-medium">{o.firstName} {o.lastName}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${meta?.badge ?? "bg-slate-50 text-slate-500 ring-slate-200"}`}>
                        {meta?.label ?? o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800 tabular-nums">{fmtCOP(o.total)}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs tabular-nums">
                      {new Date(o.createdAt).toLocaleDateString("es-CO")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.records.length === 0 && (
            <div className="text-center py-10 text-sm text-slate-400">Sin órdenes en el período seleccionado</div>
          )}
        </div>
        <TablePagination
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={data.records.length}
          onPageChange={setPage}
        />
      </ReportSection>
    </div>
  );
}

export default SalesReport;
