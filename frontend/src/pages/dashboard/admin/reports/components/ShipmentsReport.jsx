import { useCallback } from "react";
import { Truck, Package, Users, ArrowRight } from "lucide-react";

import { useShipmentsReport } from "../hooks/useReport";
import { downloadCsv }        from "../utils/csvExport";
import ReportSection          from "./ReportSection";
import { ReportLoader, ReportError } from "./ReportLoader";
import HBar from "./charts/HBar";

const STATUS_META = {
  CREATED:   { label: "Creado",     color: "#94a3b8", badge: "bg-slate-100  text-slate-600  ring-slate-200",  cls: "border-slate-200  bg-slate-50"   },
  PREPARING: { label: "Preparando", color: "#f59e0b", badge: "bg-amber-50   text-amber-700  ring-amber-200",  cls: "border-amber-200  bg-amber-50"   },
  SHIPPED:   { label: "Enviado",    color: "#3b82f6", badge: "bg-blue-50    text-blue-700   ring-blue-200",   cls: "border-blue-200   bg-blue-50"    },
  DELIVERED: { label: "Entregado",  color: "#10b981", badge: "bg-green-50   text-green-700  ring-green-200",  cls: "border-green-200  bg-green-50"   },
  RETURNED:  { label: "Devuelto",   color: "#f43f5e", badge: "bg-red-50     text-red-700    ring-red-200",    cls: "border-red-200    bg-red-50"     },
};

const PIPELINE_ORDER = ["CREATED", "PREPARING", "SHIPPED", "DELIVERED", "RETURNED"];

function ShipmentsReport({ filters }) {
  const { data, loading, error } = useShipmentsReport(filters);

  const exportCsv = useCallback(() => {
    if (!data) return;
    downloadCsv("envios.csv",
      ["Orden", "Cliente", "Estado", "Transportista", "Tracking", "Cambios de estado", "Fecha"],
      data.records.map((s) => [
        s.order?.orderNumber ?? "",
        `${s.order?.firstName ?? ""} ${s.order?.lastName ?? ""}`.trim(),
        STATUS_META[s.status]?.label ?? s.status,
        s.carrier ?? "—",
        s.trackingNumber ?? "—",
        s.history?.length ?? 0,
        new Date(s.createdAt).toLocaleDateString("es-CO"),
      ])
    );
  }, [data]);

  if (loading) return <ReportLoader />;
  if (error)   return <ReportError message={error} />;
  if (!data)   return null;

  const totalShipments = data.byStatus.reduce((s, x) => s + x.count, 0) || 1;
  const maxCarrier     = Math.max(...data.byCarrier.map((c) => c.count), 1);

  return (
    <div className="space-y-5">
      {/* Pipeline visual */}
      <ReportSection title="Pipeline de envíos" icon={Package}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {PIPELINE_ORDER.map((status, i) => {
            const meta  = STATUS_META[status];
            const found = data.byStatus.find((s) => s.status === status);
            const count = found?.count ?? 0;
            const pct   = Math.round((count / totalShipments) * 100);
            const isLast = i === PIPELINE_ORDER.length - 1;

            return (
              <div key={status} className="flex sm:flex-col items-center gap-1.5 sm:gap-0 flex-1">
                <div className={`flex flex-col items-center text-center rounded-xl border p-3 w-full ${meta?.cls ?? "border-slate-200 bg-slate-50"}`}>
                  <span className="text-xs font-semibold">{meta?.label}</span>
                  <span className="text-2xl font-bold tabular-nums mt-1">{count}</span>
                  <span className="text-[10px] opacity-50 mt-0.5">{pct}%</span>
                </div>
                {!isLast && (
                  <ArrowRight size={14} className="text-slate-300 shrink-0 sm:rotate-90 sm:my-1" />
                )}
              </div>
            );
          })}
        </div>
      </ReportSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Por transportista */}
        <ReportSection title="Por transportista" icon={Truck}>
          {data.byCarrier.length > 0 ? (
            <div className="space-y-1">
              {data.byCarrier.map((c) => (
                <HBar
                  key={c.carrier}
                  label={c.carrier ? c.carrier.charAt(0).toUpperCase() + c.carrier.slice(1).toLowerCase() : "Sin asignar"}
                  value={c.count}
                  max={maxCarrier}
                  displayValue={`${c.count} envíos`}
                  color="#3b82f6"
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Sin transportista asignado aún</p>
          )}
        </ReportSection>

        {/* Operadores más activos */}
        <ReportSection title="Operadores más activos" icon={Users}>
          {data.byOperator.length > 0 ? (
            <div className="space-y-3">
              {data.byOperator.map((o, i) => (
                <div key={o.user?.id ?? i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-indigo-600">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{o.user?.name ?? "Desconocido"}</p>
                    <p className="text-[10px] text-slate-400 truncate">{o.user?.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-indigo-600 tabular-nums">{o.count}</p>
                    <p className="text-[10px] text-slate-400">cambios</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Sin datos de operador aún</p>
          )}
        </ReportSection>
      </div>

      {/* Tabla de envíos */}
      <ReportSection title="Detalle de envíos" icon={Truck} onExport={exportCsv} noPad>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                {["Orden", "Cliente", "Estado", "Transportista", "Tracking", "Historial", "Fecha"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.records.map((s) => {
                const meta = STATUS_META[s.status];
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3 font-mono text-[11px] font-semibold text-indigo-600">
                      {s.order?.orderNumber}
                    </td>
                    <td className="px-5 py-3 text-slate-700 font-medium text-xs">
                      {s.order?.firstName} {s.order?.lastName}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${meta?.badge ?? "bg-slate-50 text-slate-500 ring-slate-200"}`}>
                        {meta?.label ?? s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 capitalize">
                      {s.carrier?.toLowerCase() ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-400">
                      {s.trackingNumber ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                        {s.history?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400 tabular-nums">
                      {new Date(s.createdAt).toLocaleDateString("es-CO")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.records.length === 0 && (
            <div className="text-center py-10 text-sm text-slate-400">Sin envíos en el período seleccionado</div>
          )}
        </div>
      </ReportSection>
    </div>
  );
}

export default ShipmentsReport;
