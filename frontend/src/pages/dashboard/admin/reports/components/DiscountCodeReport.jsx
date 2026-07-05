import { useState, useEffect } from "react";
import { TicketPercent, DollarSign, Hash, Award } from "lucide-react";

import { useDiscountCodeReport } from "../hooks/useReport";
import ReportCard            from "./ReportCard";
import ReportSection         from "./ReportSection";
import { ReportLoader, ReportError } from "./ReportLoader";
import TablePagination       from "@/components/ui/TablePagination";
import HBar       from "./charts/HBar";

const PAGE_SIZE = 15;

const fmtCOP = (n) => `$${Number(n).toLocaleString("es-CO")}`;

const TYPE_LABEL = {
  PERCENTAGE: "Porcentaje",
  FIXED: "Monto fijo",
  FREE_SHIPPING: "Envío gratis",
};

function DiscountCodeReport({ filters }) {
  const { data, loading, error } = useDiscountCodeReport(filters);
  const [page, setPage] = useState(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setPage(1), [JSON.stringify(filters)]);

  if (loading) return <ReportLoader />;
  if (error)   return <ReportError message={error} />;
  if (!data)   return null;

  const pagedRecords = data.records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const maxAmount = Math.max(...data.byDiscountCode.map((d) => d.amount), 1);

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ReportCard
          title="Cupones usados"
          value={data.totals.count}
          icon={TicketPercent}
          colorClass="text-indigo-600"
          accent="bg-indigo-400"
        />
        <ReportCard
          title="Total descontado"
          value={fmtCOP(data.totals.amount)}
          icon={DollarSign}
          colorClass="text-rose-600"
          accent="bg-rose-400"
        />
      </div>

      {/* Top cupones */}
      <ReportSection title="Cupones más usados" icon={Award}>
        {data.byDiscountCode.length > 0 ? (
          <div className="space-y-3">
            {data.byDiscountCode.map((d, i) => (
              <div key={d.discountCode?.code ?? i} className="space-y-1">
                <HBar
                  label={d.discountCode?.code ?? "Cupón eliminado"}
                  value={d.amount}
                  max={maxAmount}
                  displayValue={fmtCOP(d.amount)}
                  color="#f43f5e"
                />
                <p className="text-[10px] text-slate-400 pl-32">
                  {d.count} uso{d.count !== 1 ? "s" : ""}
                  {d.discountCode?.type ? ` · ${TYPE_LABEL[d.discountCode.type] ?? d.discountCode.type}` : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-8">Sin cupones usados en el período seleccionado</p>
        )}
      </ReportSection>

      {/* Tabla detalle */}
      <ReportSection title="Detalle de usos" icon={Hash} noPad>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                {["Cupón", "Tipo", "Orden", "Cliente", "Monto descontado", "Fecha"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pagedRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3 font-mono text-[11px] font-semibold text-indigo-600">
                    {r.discountCode?.code ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">
                    {TYPE_LABEL[r.discountCode?.type] ?? r.discountCode?.type ?? "—"}
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-slate-600">
                    {r.order?.orderNumber ?? `#${r.orderId}`}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">
                    {r.order ? `${r.order.firstName ?? ""} ${r.order.lastName ?? ""}`.trim() : "—"}
                  </td>
                  <td className="px-5 py-3 font-semibold text-rose-600 tabular-nums">-{fmtCOP(r.amount)}</td>
                  <td className="px-5 py-3 text-xs text-slate-400 tabular-nums">
                    {new Date(r.createdAt).toLocaleDateString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.records.length === 0 && (
            <div className="text-center py-10 text-sm text-slate-400">Sin cupones usados en el período seleccionado</div>
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

export default DiscountCodeReport;
