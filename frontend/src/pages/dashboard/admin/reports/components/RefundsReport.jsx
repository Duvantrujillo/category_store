import { useState, useEffect } from "react";
import { Wallet, DollarSign, CheckCircle, Users } from "lucide-react";

import { useRefundsReport } from "../hooks/useReport";
import ReportCard            from "./ReportCard";
import ReportSection         from "./ReportSection";
import { ReportLoader, ReportError } from "./ReportLoader";
import TablePagination       from "@/components/ui/TablePagination";
import DonutChart from "./charts/DonutChart";
import HBar       from "./charts/HBar";

const PAGE_SIZE = 15;

const fmtCOP = (n) => `$${Number(n).toLocaleString("es-CO")}`;

const STATUS_META = {
  PENDING:   { label: "Pendiente", color: "#f59e0b", badge: "bg-amber-50  text-amber-700  ring-amber-200",  card: "border-amber-200  bg-amber-50"  },
  PROCESSED: { label: "Procesado", color: "#10b981", badge: "bg-green-50  text-green-700  ring-green-200",  card: "border-green-200  bg-green-50"  },
  FAILED:    { label: "Fallido",   color: "#f43f5e", badge: "bg-red-50    text-red-700    ring-red-200",    card: "border-red-200    bg-red-50"    },
};

function RefundsReport({ filters }) {
  const { data, loading, error } = useRefundsReport(filters);
  const [page, setPage] = useState(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setPage(1), [JSON.stringify(filters)]);

  if (loading) return <ReportLoader />;
  if (error)   return <ReportError message={error} />;
  if (!data)   return null;

  const pagedRecords   = data.records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const processedEntry = data.byStatus.find((s) => s.status === "PROCESSED");
  const donutSegments  = data.byStatus.map((s) => ({
    label: STATUS_META[s.status]?.label ?? s.status,
    value: s.count,
    color: STATUS_META[s.status]?.color ?? "#94a3b8",
  }));

  const maxProcessorAmt = Math.max(...data.byProcessor.map((p) => p.amount), 1);

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ReportCard
          title="Total reembolsos"
          value={data.totals.count}
          icon={Wallet}
          colorClass="text-indigo-600"
          accent="bg-indigo-400"
        />
        <ReportCard
          title="Monto total"
          value={fmtCOP(data.totals.amount)}
          icon={DollarSign}
          colorClass="text-violet-600"
          accent="bg-violet-400"
        />
        <ReportCard
          title="Monto procesado"
          value={fmtCOP(processedEntry?.amount ?? 0)}
          sub={`${processedEntry?.count ?? 0} procesados`}
          icon={CheckCircle}
          colorClass="text-emerald-600"
          accent="bg-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Donut: por estado */}
        <ReportSection title="Distribución por estado" icon={Wallet}>
          <div className="flex flex-col items-center gap-5 py-2">
            <DonutChart
              segments={donutSegments}
              size={140}
              thickness={18}
              centerLabel={data.totals.count}
              centerSub="reembolsos"
            />
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
              {donutSegments.map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-slate-500">{s.label}</span>
                  <span className="text-xs font-bold text-slate-800 tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>

            {/* Montos por estado */}
            <div className="w-full space-y-2 pt-4 border-t border-slate-100">
              {data.byStatus.map((s) => {
                const meta = STATUS_META[s.status];
                return (
                  <div key={s.status} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${meta?.card ?? "border-slate-200 bg-slate-50"}`}>
                    <span className="text-xs font-semibold">{meta?.label ?? s.status}</span>
                    <div className="text-right">
                      <p className="text-xs font-bold tabular-nums">{fmtCOP(s.amount)}</p>
                      <p className="text-[10px] opacity-60">{s.count} registros</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ReportSection>

        {/* HBars: procesadores */}
        <ReportSection title="Procesados por usuario" icon={Users}>
          {data.byProcessor.length > 0 ? (
            <div className="space-y-3">
              {data.byProcessor.map((p, i) => (
                <div key={p.user?.id ?? i} className="space-y-1">
                  <HBar
                    label={p.user?.name ?? "Desconocido"}
                    value={p.amount}
                    max={maxProcessorAmt}
                    displayValue={fmtCOP(p.amount)}
                    color="#8b5cf6"
                  />
                  <p className="text-[10px] text-slate-400 pl-32">{p.count} operaciones · {p.user?.email}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Sin datos de procesador aún</p>
          )}
        </ReportSection>
      </div>

      {/* Tabla detalle */}
      <ReportSection title="Detalle de reembolsos" icon={Wallet} noPad>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                {["Orden", "Estado", "Monto", "Método", "Procesado por", "Fecha"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pagedRecords.map((r) => {
                const meta = STATUS_META[r.status];
                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3 font-mono text-[11px] font-semibold text-indigo-600">
                      {r.returnRequest?.order?.orderNumber ?? `#${r.returnRequestId}`}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${meta?.badge ?? "bg-slate-50 text-slate-500 ring-slate-200"}`}>
                        {meta?.label ?? r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800 tabular-nums">{fmtCOP(r.amount)}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{r.method ?? "—"}</td>
                    <td className="px-5 py-3">
                      {r.processedBy
                        ? <div><p className="text-xs font-medium text-slate-700">{r.processedBy.name}</p><p className="text-[10px] text-slate-400">{r.processedBy.email}</p></div>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400 tabular-nums">
                      {new Date(r.createdAt).toLocaleDateString("es-CO")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.records.length === 0 && (
            <div className="text-center py-10 text-sm text-slate-400">Sin reembolsos en el período seleccionado</div>
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

export default RefundsReport;
