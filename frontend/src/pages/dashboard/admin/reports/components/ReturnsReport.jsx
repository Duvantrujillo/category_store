import { useState, useEffect } from "react";
import { RotateCcw, Users, FileText } from "lucide-react";

import { useReturnsReport } from "../hooks/useReport";
import ReportSection        from "./ReportSection";
import { ReportLoader, ReportError } from "./ReportLoader";
import TablePagination      from "@/components/ui/TablePagination";
import DonutChart from "./charts/DonutChart";
import HBar       from "./charts/HBar";

const PAGE_SIZE = 15;

const STATUS_META = {
  PENDING:   { label: "Pendiente",  color: "#f59e0b", badge: "bg-amber-50  text-amber-700  ring-amber-200",  card: "border-amber-200  bg-amber-50"  },
  APPROVED:  { label: "Aprobada",   color: "#3b82f6", badge: "bg-blue-50   text-blue-700   ring-blue-200",   card: "border-blue-200   bg-blue-50"   },
  REJECTED:  { label: "Rechazada",  color: "#f43f5e", badge: "bg-red-50    text-red-700    ring-red-200",    card: "border-red-200    bg-red-50"    },
  RECEIVED:  { label: "Recibida",   color: "#8b5cf6", badge: "bg-violet-50 text-violet-700 ring-violet-200", card: "border-violet-200 bg-violet-50" },
  COMPLETED: { label: "Completada", color: "#10b981", badge: "bg-green-50  text-green-700  ring-green-200",  card: "border-green-200  bg-green-50"  },
};

const RES_META = {
  REFUND:       { label: "Reembolso",      color: "#6366f1" },
  EXCHANGE:     { label: "Cambio",         color: "#f59e0b" },
  STORE_CREDIT: { label: "Crédito tienda", color: "#3b82f6" },
};

function ReturnsReport({ filters }) {
  const { data, loading, error } = useReturnsReport(filters);
  const [page, setPage] = useState(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setPage(1), [JSON.stringify(filters)]);

  if (loading) return <ReportLoader />;
  if (error)   return <ReportError message={error} />;
  if (!data)   return null;

  const pagedRecords  = data.records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalByStatus = data.byStatus.reduce((s, x) => s + x.count, 0);
  const donutStatus   = data.byStatus.map((s) => ({
    label: STATUS_META[s.status]?.label ?? s.status,
    value: s.count,
    color: STATUS_META[s.status]?.color ?? "#94a3b8",
  }));

  const maxByRes = Math.max(...data.byResolution.map((r) => r.count), 1);

  return (
    <div className="space-y-5">
      {/* Cards por estado */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {data.byStatus.map((s) => {
          const meta = STATUS_META[s.status];
          const pct  = totalByStatus > 0 ? Math.round((s.count / totalByStatus) * 100) : 0;
          return (
            <div key={s.status} className={`rounded-xl border p-4 ${meta?.card ?? "border-slate-200 bg-white"}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-current opacity-60 mb-1.5">
                {meta?.label ?? s.status}
              </p>
              <p className="text-2xl font-bold tabular-nums">{s.count}</p>
              <p className="text-[10px] mt-1 opacity-50">{pct}% del total</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Donut: distribución por estado */}
        <ReportSection title="Distribución por estado" icon={RotateCcw}>
          <div className="flex flex-col items-center gap-5 py-2">
            <DonutChart
              segments={donutStatus}
              size={140}
              thickness={18}
              centerLabel={totalByStatus}
              centerSub="solicitudes"
            />
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
              {donutStatus.map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-slate-500">{s.label}</span>
                  <span className="text-xs font-bold text-slate-800 tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ReportSection>

        {/* HBars: tipo de resolución */}
        <ReportSection title="Tipo de resolución" icon={FileText}>
          {data.byResolution.length > 0 ? (
            <div className="space-y-1">
              {data.byResolution.map((r) => {
                const meta = RES_META[r.resolution];
                return (
                  <HBar
                    key={r.resolution}
                    label={meta?.label ?? r.resolution}
                    value={r.count}
                    max={maxByRes}
                    displayValue={`${r.count} solicitudes`}
                    color={meta?.color ?? "#6366f1"}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">Sin datos de resolución aún</p>
          )}

          {/* Registros por usuario */}
          {data.byUser.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Users size={12} />
                Registros por usuario
              </p>
              <div className="space-y-2">
                {data.byUser.map((u) => (
                  <div key={u.user?.id ?? "unknown"} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-700">{u.user?.name ?? "Desconocido"}</p>
                      <p className="text-[10px] text-slate-400">{u.user?.email}</p>
                    </div>
                    <span className="text-sm font-bold text-indigo-600 tabular-nums">{u.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ReportSection>
      </div>

      {/* Tabla detalle */}
      <ReportSection title="Detalle de solicitudes" icon={FileText} noPad>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                {["Orden", "Estado", "Resolución", "Registrado por", "Aprobado por", "Fecha"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pagedRecords.map((r) => {
                const sMeta = STATUS_META[r.status];
                const rMeta = RES_META[r.resolution];
                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3 font-mono text-[11px] font-semibold text-indigo-600">
                      {r.order?.orderNumber ?? `#${r.id}`}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${sMeta?.badge ?? "bg-slate-50 text-slate-500 ring-slate-200"}`}>
                        {sMeta?.label ?? r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{rMeta?.label ?? "—"}</td>
                    <td className="px-5 py-3">
                      {r.registeredBy
                        ? <div><p className="text-xs font-medium text-slate-700">{r.registeredBy.name}</p><p className="text-[10px] text-slate-400">{r.registeredBy.email}</p></div>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {r.approvedBy
                        ? <div><p className="text-xs font-medium text-slate-700">{r.approvedBy.name}</p><p className="text-[10px] text-slate-400">{r.approvedBy.email}</p></div>
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
            <div className="text-center py-10 text-sm text-slate-400">Sin solicitudes en el período seleccionado</div>
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

export default ReturnsReport;
