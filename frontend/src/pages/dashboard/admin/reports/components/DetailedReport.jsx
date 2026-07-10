import { useCallback, useState, useEffect } from "react";
import {
  FileText, TrendingUp, TrendingDown, DollarSign,
  RotateCcw, Wallet, Package, PackagePlus, MapPin, Phone, Mail, CreditCard, Truck,
} from "lucide-react";

import { useDetailedReport } from "../hooks/useReport";
import { ReportLoader, ReportError } from "./ReportLoader";
import ReportSection   from "./ReportSection";
import ReportCard      from "./ReportCard";
import TablePagination from "@/components/ui/TablePagination";

const PAGE_SIZE = 15;

/* ─── Formatters ─────────────────────────────────────────── */
const fmtCOP  = (n) => `$${Number(n ?? 0).toLocaleString("es-CO")}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("es-CO");
const fmtDateTime = (d) => new Date(d).toLocaleString("es-CO");

const STATUS_LABEL = { PAID: "Pagada", REFUNDED: "Reembolsada" };
const RETURN_STATUS_LABEL = {
  PENDING: "Pendiente", RECEIVED: "Recibida",
  APPROVED: "Aprobada", REJECTED: "Rechazada", COMPLETED: "Completada",
};
const RES_LABEL = {
  REFUND: "Reembolso", EXCHANGE: "Cambio", STORE_CREDIT: "Crédito tienda",
};
const REFUND_STATUS_LABEL = { PENDING: "Pendiente", PROCESSED: "Procesado", FAILED: "Fallido" };

/* ─── PDF via browser print ──────────────────────────────── */
function buildPdfHtml(data, period) {
  const { summary, orders } = data;
  const netPct    = summary.grossRevenue > 0
    ? Math.round((summary.netRevenue   / summary.grossRevenue) * 100) : 100;
  const refundPct = 100 - netPct;
  const hasReturns = orders.some((o) => o.returns.length > 0);

  const escHtml = (s) =>
    String(s ?? "—")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const orderRows = orders.map((o) => `
    <tr>
      <td class="mono">${escHtml(o.orderNumber)}</td>
      <td>
        <strong>${escHtml(o.firstName)} ${escHtml(o.lastName)}</strong><br>
        <span class="muted">${escHtml(o.email)}</span>
      </td>
      <td>
        <span class="muted">${escHtml(o.municipality)}, ${escHtml(o.departament)}</span><br>
        <span class="muted">${escHtml(o.phoneNumber)}</span>
      </td>
      <td>${fmtDate(o.createdAt)}</td>
      <td><span class="badge ${o.status === "PAID" ? "badge-green" : "badge-violet"}">${STATUS_LABEL[o.status] ?? o.status}</span></td>
      <td class="tr muted">${fmtCOP(o.subtotal)}</td>
      <td class="tr" style="color:#0369a1">${fmtCOP(o.shippingCost ?? 11000)}</td>
      <td class="tr">${fmtCOP(o.grossTotal)}</td>
      <td class="tc ${o.returnedItemsQty > 0 ? "amber" : "muted"}">${o.returnedItemsQty || "—"}</td>
      <td class="tr ${o.refundedAmount > 0 ? "red" : "muted"}">${o.refundedAmount > 0 ? "−" + fmtCOP(o.refundedAmount) : "—"}</td>
      <td class="tr green bold">${fmtCOP(o.netTotal)}</td>
    </tr>`).join("");

  const productRows = orders.flatMap((o) =>
    o.items.map((item) => `
    <tr>
      <td class="mono">${escHtml(o.orderNumber)}</td>
      <td>${escHtml(item.productName)}</td>
      <td class="tc">${item.quantity}</td>
      <td class="tr">${fmtCOP(item.unitPrice)}</td>
      <td class="tr">${fmtCOP(item.subtotal)}</td>
      <td class="tc ${item.returnedQty > 0 ? "amber" : "muted"}">${item.returnedQty || "—"}</td>
      <td class="tr ${item.returnedSubtotal > 0 ? "red" : "muted"}">${item.returnedSubtotal > 0 ? "−" + fmtCOP(item.returnedSubtotal) : "—"}</td>
      <td class="tr green bold">${fmtCOP(item.netSubtotal)}</td>
    </tr>`)
  ).join("");

  const hasBundles = orders.some((o) => o.bundleItems?.length > 0);

  const bundleRows = orders.flatMap((o) =>
    (o.bundleItems ?? []).map((bundleItem) => `
    <tr>
      <td class="mono">${escHtml(o.orderNumber)}</td>
      <td><strong>${escHtml(bundleItem.bundleName)}</strong> <span class="badge badge-violet">Combo</span></td>
      <td class="tc">${bundleItem.quantity}</td>
      <td class="tr">${fmtCOP(bundleItem.unitPrice)}</td>
      <td class="tr">${fmtCOP(bundleItem.subtotal)}</td>
      <td class="muted">${bundleItem.components.map((c) => `${escHtml(c.productName)} ×${c.quantity}`).join(", ")}</td>
    </tr>`)
  ).join("");

  const returnRows = hasReturns
    ? orders.flatMap((o) =>
        o.returns.map((r) => {
          const items   = r.items.map((i) => `${escHtml(i.productName)} ×${i.quantity}`).join(", ");
          const refunds = r.refunds.map((rf) =>
            `<span class="${rf.status === "PROCESSED" ? "green" : rf.status === "FAILED" ? "red" : "amber"}">${REFUND_STATUS_LABEL[rf.status] ?? rf.status}: ${fmtCOP(rf.amount)}${rf.method ? " (" + escHtml(rf.method) + ")" : ""}</span>`
          ).join("<br>");
          return `
          <tr>
            <td class="mono">${escHtml(o.orderNumber)}</td>
            <td>${escHtml(o.firstName)} ${escHtml(o.lastName)}</td>
            <td><span class="badge badge-amber">${RETURN_STATUS_LABEL[r.status] ?? r.status}</span></td>
            <td>${RES_LABEL[r.resolution] ?? escHtml(r.resolution)}</td>
            <td>${escHtml(r.reason)}</td>
            <td>${escHtml(items)}</td>
            <td>${refunds || "—"}</td>
            <td class="muted">${r.registeredBy ? escHtml(r.registeredBy.name) : "—"}</td>
            <td>${fmtDate(r.createdAt)}</td>
          </tr>`;
        })
      ).join("")
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte Detallado · ${escHtml(period)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;font-size:9.5px;color:#0f172a;background:#fff}
  @page{margin:12mm 14mm;size:A4 landscape}

  /* Header */
  .ph{background:#4f46e5;color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:flex-start;border-radius:6px;margin-bottom:14px}
  .ph h1{font-size:17px;font-weight:700;letter-spacing:-0.02em}
  .ph p{font-size:8.5px;opacity:.8;margin-top:3px}
  .ph .meta{text-align:right;font-size:8px;opacity:.75;line-height:1.6}

  /* KPI row */
  .kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px}
  .kpi{border-radius:6px;padding:11px 13px;color:#fff}
  .kpi.ind{background:#4f46e5}.kpi.sky{background:#0284c7}.kpi.amb{background:#f59e0b}.kpi.red{background:#ef4444}.kpi.eme{background:#10b981;border:2px solid #059669}
  .kpi .lbl{font-size:7.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;opacity:.82;margin-bottom:3px}
  .kpi .val{font-size:16px;font-weight:700;line-height:1.1}
  .kpi .sub{font-size:7px;opacity:.72;margin-top:3px}

  /* Equation */
  .eq{background:#f0fdf4;border-left:3px solid #10b981;padding:7px 12px;border-radius:0 5px 5px 0;font-size:9px;color:#374151;margin-bottom:14px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
  .eq .g{color:#059669;font-weight:700;font-size:11px}
  .eq .op{color:#94a3b8;font-size:11px}

  /* Bar */
  .bar-wrap{height:12px;background:#f1f5f9;border-radius:99px;overflow:hidden;display:flex;margin:6px 0 4px}
  .bar-n{background:#10b981;height:100%}
  .bar-r{background:#ef4444;height:100%}
  .bar-legend{display:flex;gap:14px;font-size:8px;color:#475569}
  .bar-legend span{display:flex;align-items:center;gap:4px}
  .bl-n::before{content:'';display:inline-block;width:10px;height:10px;border-radius:2px;background:#10b981}
  .bl-r::before{content:'';display:inline-block;width:10px;height:10px;border-radius:2px;background:#ef4444}

  /* Section */
  .sec{margin-bottom:18px}
  .sec-title{font-size:10px;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #e0e7ff;padding-bottom:4px;margin-bottom:8px}

  /* Tables */
  table{width:100%;border-collapse:collapse;font-size:8px}
  thead tr{background:#1e293b;color:#fff}
  th{padding:5px 7px;font-weight:700;font-size:7.5px;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap}
  td{padding:4.5px 7px;border-bottom:1px solid #f1f5f9;vertical-align:top}
  tr:nth-child(even) td{background:#f8fafc}
  tfoot tr td{background:#1e293b;color:#fff;font-weight:700;padding:5px 7px}

  /* Util */
  .mono{font-family:'Courier New',monospace;color:#4f46e5;font-size:8px}
  .tr{text-align:right}.tc{text-align:center}.bold{font-weight:700}
  .muted{color:#94a3b8;font-size:7.5px}
  .green{color:#059669}.red{color:#dc2626}.amber{color:#d97706}
  .badge{display:inline-block;padding:2px 6px;border-radius:99px;font-size:7px;font-weight:700}
  .badge-green{background:#dcfce7;color:#166534}
  .badge-violet{background:#ede9fe;color:#5b21b6}
  .badge-amber{background:#fef3c7;color:#92400e}

  /* Print helpers */
  @media print{
    .new-page{page-break-before:always}
    .avoid-break{page-break-inside:avoid}
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  }

  .footer{text-align:center;font-size:7.5px;color:#94a3b8;margin-top:16px;padding-top:8px;border-top:1px solid #e2e8f0}
</style>
</head>
<body>

<!-- HEADER -->
<div class="ph">
  <div>
    <h1>Reporte Detallado de Ventas</h1>
    <p>Período: ${escHtml(period)}</p>
  </div>
  <div class="meta">
    <div>Generado: ${escHtml(fmtDateTime(new Date()))}</div>
    <div>${summary.ordersCount} órdenes · ${summary.totalReturnRequests} solicitudes de devolución</div>
  </div>
</div>

<!-- KPIs -->
<div class="kpis">
  <div class="kpi ind">
    <div class="lbl">Ventas brutas</div>
    <div class="val">${escHtml(fmtCOP(summary.grossRevenue))}</div>
    <div class="sub">${summary.ordersCount} órdenes pagadas</div>
  </div>
  <div class="kpi sky">
    <div class="lbl">Total envíos</div>
    <div class="val">${escHtml(fmtCOP(summary.totalShipping))}</div>
    <div class="sub">${summary.ordersCount} envíos · $11.000 c/u</div>
  </div>
  <div class="kpi amb">
    <div class="lbl">Devoluciones</div>
    <div class="val">${summary.totalReturnRequests}</div>
    <div class="sub">${summary.totalReturnedItems} unidades devueltas</div>
  </div>
  <div class="kpi red">
    <div class="lbl">Reembolsado</div>
    <div class="val">${escHtml(fmtCOP(summary.refundedAmount))}</div>
    <div class="sub">solo reembolsos procesados</div>
  </div>
  <div class="kpi eme">
    <div class="lbl">✦ Ingreso neto</div>
    <div class="val">${escHtml(fmtCOP(summary.netRevenue))}</div>
    <div class="sub">bruto − reembolsos = ${netPct}% retenido</div>
  </div>
</div>

<!-- EQUATION + BAR -->
<div class="eq">
  <span>${escHtml(fmtCOP(summary.grossRevenue))} <span class="muted">(ventas brutas)</span></span>
  <span class="op">−</span>
  <span>${escHtml(fmtCOP(summary.refundedAmount))} <span class="muted">(reembolsado)</span></span>
  <span class="op">=</span>
  <span class="g">${escHtml(fmtCOP(summary.netRevenue))} ingreso neto</span>
</div>
<div class="bar-wrap">
  <div class="bar-n" style="width:${netPct}%"></div>
  <div class="bar-r" style="width:${refundPct}%"></div>
</div>
<div class="bar-legend" style="margin-bottom:14px">
  <span class="bl-n">Ingreso neto ${netPct}%</span>
  <span class="bl-r">Reembolsado ${refundPct}%</span>
</div>

<!-- ORDERS TABLE -->
<div class="sec avoid-break">
  <div class="sec-title">Detalle por orden</div>
  <table>
    <thead>
      <tr>
        <th>Orden</th><th>Cliente</th><th>Ubicación / Tel.</th><th>Fecha</th><th>Estado</th>
        <th class="tr">Subtotal</th><th class="tr">Envío</th><th class="tr">Venta bruta</th>
        <th class="tc">Unid. dev.</th><th class="tr">Reembolsado</th><th class="tr">Ingreso neto</th>
      </tr>
    </thead>
    <tbody>${orderRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="5">TOTALES</td>
        <td class="tr">—</td>
        <td class="tr">${escHtml(fmtCOP(summary.totalShipping))}</td>
        <td class="tr">${escHtml(fmtCOP(summary.grossRevenue))}</td>
        <td class="tc">${summary.totalReturnedItems || "—"}</td>
        <td class="tr">${summary.refundedAmount > 0 ? "−" + escHtml(fmtCOP(summary.refundedAmount)) : "—"}</td>
        <td class="tr">${escHtml(fmtCOP(summary.netRevenue))}</td>
      </tr>
    </tfoot>
  </table>
</div>

<!-- PRODUCTS TABLE -->
<div class="sec new-page">
  <div class="sec-title">Detalle por producto</div>
  <table>
    <thead>
      <tr>
        <th>Orden</th><th>Producto</th>
        <th class="tc">Qty vendida</th><th class="tr">Precio unit.</th><th class="tr">Subtotal</th>
        <th class="tc">Qty devuelta</th><th class="tr">Subtotal dev.</th><th class="tr">Neto</th>
      </tr>
    </thead>
    <tbody>${productRows}</tbody>
  </table>
</div>

${hasBundles ? `
<!-- BUNDLES TABLE -->
<div class="sec new-page">
  <div class="sec-title">Detalle por combo</div>
  <table>
    <thead>
      <tr>
        <th>Orden</th><th>Combo</th>
        <th class="tc">Qty vendida</th><th class="tr">Precio unit.</th><th class="tr">Subtotal</th>
        <th>Incluye</th>
      </tr>
    </thead>
    <tbody>${bundleRows}</tbody>
  </table>
</div>
` : ""}

${hasReturns ? `
<!-- RETURNS TABLE -->
<div class="sec new-page">
  <div class="sec-title">Solicitudes de devolución y reembolsos</div>
  <table>
    <thead>
      <tr>
        <th>Orden</th><th>Cliente</th><th>Estado devol.</th><th>Resolución</th>
        <th>Motivo</th><th>Productos devueltos</th><th>Reembolsos</th>
        <th>Registrado por</th><th>Fecha</th>
      </tr>
    </thead>
    <tbody>${returnRows}</tbody>
  </table>
</div>
` : ""}

<div class="footer">
  Reporte generado el ${escHtml(fmtDateTime(new Date()))} · Category Store
  &nbsp;|&nbsp; Período: ${escHtml(period)}
  &nbsp;|&nbsp; ${summary.ordersCount} órdenes · Ingreso neto: ${escHtml(fmtCOP(summary.netRevenue))}
</div>

</body>
</html>`;
}

function printPdf(data, period) {
  const html = buildPdfHtml(data, period);
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none";
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
  iframe.contentWindow.onafterprint = () => document.body.removeChild(iframe);
  setTimeout(() => iframe.contentWindow.print(), 400);
}

/* ─── Screen component ───────────────────────────────────── */
export default function DetailedReport({ filters }) {
  const { data, loading, error } = useDetailedReport(filters);

  const period =
    filters.from && filters.to ? `${filters.from} → ${filters.to}`
    : filters.from              ? `Desde ${filters.from}`
    : filters.to                ? `Hasta ${filters.to}`
    : "Todo el tiempo";

  const [orderPage,  setOrderPage]  = useState(1);
  const [itemPage,   setItemPage]   = useState(1);
  const [bundlePage, setBundlePage] = useState(1);
  const [returnPage, setReturnPage] = useState(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setOrderPage(1); setItemPage(1); setBundlePage(1); setReturnPage(1); }, [JSON.stringify(filters)]);

  const handlePdf = useCallback(() => {
    if (data) printPdf(data, period);
  }, [data, period]);

  if (loading) return <ReportLoader />;
  if (error)   return <ReportError message={error} />;
  if (!data)   return null;

  const { summary, orders } = data;

  const pagedOrders = orders.slice((orderPage  - 1) * PAGE_SIZE, orderPage  * PAGE_SIZE);

  const allItems   = orders.flatMap((o) =>
    o.items.map((item) => ({ ...item, _orderNumber: o.orderNumber, _key: `${o.id}-${item.productName}` }))
  );
  const pagedItems = allItems.slice((itemPage - 1) * PAGE_SIZE, itemPage * PAGE_SIZE);

  const allBundles = orders.flatMap((o) =>
    (o.bundleItems ?? []).map((bundleItem, bi) => ({
      ...bundleItem,
      _orderNumber: o.orderNumber,
      _key: `${o.id}-b${bi}-${bundleItem.bundleName}`,
    }))
  );
  const pagedBundles = allBundles.slice((bundlePage - 1) * PAGE_SIZE, bundlePage * PAGE_SIZE);

  const allReturns   = orders.flatMap((o) =>
    o.returns.map((r, ri) => ({ ...r, _orderNumber: o.orderNumber, _firstName: o.firstName, _lastName: o.lastName, _key: `${o.id}-r${ri}` }))
  );
  const pagedReturns = allReturns.slice((returnPage - 1) * PAGE_SIZE, returnPage * PAGE_SIZE);
  const netPct    = summary.grossRevenue > 0
    ? Math.round((summary.netRevenue / summary.grossRevenue) * 100) : 100;
  const refundPct = 100 - netPct;
  const hasReturns = orders.some((o) => o.returns.length > 0);

  return (
    <div className="space-y-5">

      {/* ── Cabecera descarga ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-indigo-100 bg-indigo-50/60">
        <div>
          <p className="text-sm font-semibold text-indigo-800">Reporte consolidado detallado</p>
          <p className="text-xs text-indigo-600 mt-0.5">
            Ventas brutas · Devoluciones · Reembolsos · <span className="font-bold">Ingreso neto</span>
            {" — "}<span className="opacity-70">{period}</span>
          </p>
        </div>
        <button
          onClick={handlePdf}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <FileText size={14} />
          Descargar PDF
        </button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <ReportCard
          title="Ventas brutas"
          value={fmtCOP(summary.grossRevenue)}
          sub={`${summary.ordersCount} órdenes`}
          icon={TrendingUp}
          colorClass="text-indigo-600"
          accent="bg-indigo-400"
        />
        <ReportCard
          title="Total envíos"
          value={fmtCOP(summary.totalShipping)}
          sub={`${summary.ordersCount} envíos`}
          icon={Truck}
          colorClass="text-sky-600"
          accent="bg-sky-400"
        />
        <ReportCard
          title="Devoluciones"
          value={summary.totalReturnRequests}
          sub={`${summary.totalReturnedItems} unidades devueltas`}
          icon={RotateCcw}
          colorClass="text-amber-600"
          accent="bg-amber-400"
        />
        <ReportCard
          title="Reembolsado"
          value={fmtCOP(summary.refundedAmount)}
          sub="solo reembolsos procesados"
          icon={Wallet}
          colorClass="text-red-500"
          accent="bg-red-400"
        />
        {/* Ingreso neto destacado */}
        <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50 p-4 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-emerald-100">
              <DollarSign size={14} className="text-emerald-700" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Ingreso neto</span>
          </div>
          <p className="text-2xl font-bold tabular-nums text-emerald-800 mt-1">
            {fmtCOP(summary.netRevenue)}
          </p>
          <p className="text-[10px] text-emerald-600">{netPct}% de las ventas retenido</p>
        </div>
      </div>

      {/* ── Ecuación + barra ── */}
      <ReportSection title="Desglose de ingresos" icon={TrendingDown}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-slate-700 tabular-nums">{fmtCOP(summary.grossRevenue)}</span>
            <span className="text-slate-400 text-xs">ventas brutas</span>
            <TrendingDown size={14} className="text-red-400 mx-1" />
            <span className="font-semibold text-red-500 tabular-nums">{fmtCOP(summary.refundedAmount)}</span>
            <span className="text-slate-400 text-xs">reembolsado</span>
            <span className="text-slate-400 mx-1">=</span>
            <span className="font-bold text-emerald-700 tabular-nums text-base">{fmtCOP(summary.netRevenue)}</span>
            <span className="text-slate-400 text-xs">ingreso neto</span>
          </div>
          <div className="h-5 w-full rounded-full overflow-hidden flex bg-slate-100">
            <div className="h-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${netPct}%` }}>
              {netPct > 12 && `${netPct}%`}
            </div>
            {refundPct > 0 && (
              <div className="h-full bg-red-400 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${refundPct}%` }}>
                {refundPct > 5 && `${refundPct}%`}
              </div>
            )}
          </div>
          <div className="flex gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />Ingreso neto</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />Reembolsado</span>
          </div>
        </div>
      </ReportSection>

      {/* ── Tabla por orden ── */}
      <ReportSection title="Detalle por orden" icon={Package} noPad>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-white text-[11px] uppercase tracking-wider">
              <tr>
                {["Orden","Cliente","Dirección / Tel.","Pago","Fecha","Estado","Subtotal","Envío","Venta bruta","Unid. dev.","Reembolsado","Ingreso neto"].map((h) => (
                  <th key={h} className="text-left px-3 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pagedOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-3 font-mono text-[11px] font-semibold text-indigo-600 whitespace-nowrap">{o.orderNumber}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-800 whitespace-nowrap">{o.firstName} {o.lastName}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail size={9} />{o.email || "—"}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={9} />{o.municipality}, {o.departament}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone size={9} />{o.phoneNumber || "—"}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <CreditCard size={9} />{o.paymentMethod || o.paymentProvider || "—"}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-400 tabular-nums whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                      o.status === "PAID"
                        ? "bg-green-50 text-green-700 ring-green-200"
                        : "bg-violet-50 text-violet-700 ring-violet-200"
                    }`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-slate-500 tabular-nums whitespace-nowrap">{fmtCOP(o.subtotal)}</td>
                  <td className="px-3 py-3 text-right text-sky-600 tabular-nums whitespace-nowrap">{fmtCOP(o.shippingCost ?? 11000)}</td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-700 tabular-nums whitespace-nowrap">{fmtCOP(o.grossTotal)}</td>
                  <td className="px-3 py-3 text-center tabular-nums">
                    {o.returnedItemsQty > 0
                      ? <span className="text-amber-600 font-semibold text-xs flex items-center gap-1 justify-center"><RotateCcw size={10} />{o.returnedItemsQty}</span>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums whitespace-nowrap">
                    {o.refundedAmount > 0
                      ? <span className="font-semibold text-red-500">−{fmtCOP(o.refundedAmount)}</span>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums whitespace-nowrap">
                    <span className={`font-bold text-sm ${o.refundedAmount > 0 ? "text-emerald-700" : "text-slate-800"}`}>
                      {fmtCOP(o.netTotal)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {orders.length > 0 && (
              <tfoot className="border-t-2 border-slate-800 bg-slate-800 text-white">
                <tr>
                  <td colSpan={6} className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Totales</td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums whitespace-nowrap text-slate-300">—</td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums whitespace-nowrap text-sky-300">{fmtCOP(summary.totalShipping)}</td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums whitespace-nowrap">{fmtCOP(summary.grossRevenue)}</td>
                  <td className="px-3 py-3 text-center font-bold tabular-nums">{summary.totalReturnedItems || "—"}</td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums whitespace-nowrap">
                    {summary.refundedAmount > 0 ? `−${fmtCOP(summary.refundedAmount)}` : "—"}
                  </td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums whitespace-nowrap text-emerald-300 text-base">
                    {fmtCOP(summary.netRevenue)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
          {orders.length === 0 && (
            <p className="text-center py-12 text-sm text-slate-400">Sin órdenes en el período seleccionado</p>
          )}
        </div>
        <TablePagination
          page={orderPage}
          pageSize={PAGE_SIZE}
          totalItems={orders.length}
          onPageChange={setOrderPage}
        />
      </ReportSection>

      {/* ── Tabla por producto ── */}
      <ReportSection title="Detalle por producto" icon={Package} noPad>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-white text-[11px] uppercase tracking-wider">
              <tr>
                {["Orden","Producto","Qty vendida","Precio unit.","Subtotal","Qty devuelta","Subtotal dev.","Neto"].map((h) => (
                  <th key={h} className="text-left px-3 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pagedItems.map((item) => (
                  <tr key={item._key} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2.5 font-mono text-[11px] font-semibold text-indigo-600 whitespace-nowrap">{item._orderNumber}</td>
                    <td className="px-3 py-2.5 text-slate-700 max-w-52"><span className="line-clamp-2">{item.productName}</span></td>
                    <td className="px-3 py-2.5 text-center font-medium tabular-nums">{item.quantity}</td>
                    <td className="px-3 py-2.5 text-right text-slate-500 tabular-nums whitespace-nowrap">{fmtCOP(item.unitPrice)}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-slate-700 tabular-nums whitespace-nowrap">{fmtCOP(item.subtotal)}</td>
                    <td className="px-3 py-2.5 text-center tabular-nums">
                      {item.returnedQty > 0
                        ? <span className="text-amber-600 font-semibold">{item.returnedQty}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums whitespace-nowrap">
                      {item.returnedSubtotal > 0
                        ? <span className="font-medium text-red-500">−{fmtCOP(item.returnedSubtotal)}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums whitespace-nowrap">
                      <span className={`font-bold ${item.returnedQty > 0 ? "text-emerald-700" : "text-slate-700"}`}>
                        {fmtCOP(item.netSubtotal)}
                      </span>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={itemPage}
          pageSize={PAGE_SIZE}
          totalItems={allItems.length}
          onPageChange={setItemPage}
        />
      </ReportSection>

      {/* ── Tabla por combo ── */}
      {allBundles.length > 0 && (
        <ReportSection title="Detalle por combo" icon={PackagePlus} noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-white text-[11px] uppercase tracking-wider">
                <tr>
                  {["Orden","Combo","Qty vendida","Precio unit.","Subtotal","Incluye"].map((h) => (
                    <th key={h} className="text-left px-3 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedBundles.map((bundleItem) => (
                    <tr key={bundleItem._key} className="hover:bg-slate-50/80">
                      <td className="px-3 py-2.5 font-mono text-[11px] font-semibold text-indigo-600 whitespace-nowrap">{bundleItem._orderNumber}</td>
                      <td className="px-3 py-2.5 max-w-52">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-700 line-clamp-2">{bundleItem.bundleName}</span>
                          <span className="shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset bg-indigo-50 text-indigo-600 ring-indigo-200">
                            Combo
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center font-medium tabular-nums">{bundleItem.quantity}</td>
                      <td className="px-3 py-2.5 text-right text-slate-500 tabular-nums whitespace-nowrap">{fmtCOP(bundleItem.unitPrice)}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-700 tabular-nums whitespace-nowrap">{fmtCOP(bundleItem.subtotal)}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-500 max-w-64">
                        {bundleItem.components.map((c) => (
                          <div key={c.productName} className="flex items-baseline gap-1">
                            <span className="font-medium">{c.productName}</span>
                            <span className="text-slate-400">×{c.quantity}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination
            page={bundlePage}
            pageSize={PAGE_SIZE}
            totalItems={allBundles.length}
            onPageChange={setBundlePage}
          />
        </ReportSection>
      )}

      {/* ── Devoluciones detalladas ── */}
      {hasReturns && (
        <ReportSection title="Solicitudes de devolución y reembolsos" icon={RotateCcw} noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-white text-[11px] uppercase tracking-wider">
                <tr>
                  {["Orden","Cliente","Estado","Resolución","Motivo","Productos devueltos","Reembolsos","Registrado por","Fecha"].map((h) => (
                    <th key={h} className="text-left px-3 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedReturns.map((r) => (
                    <tr key={r._key} className="hover:bg-slate-50/80">
                      <td className="px-3 py-3 font-mono text-[11px] font-semibold text-indigo-600 whitespace-nowrap">{r._orderNumber}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <p className="font-medium text-slate-800">{r._firstName} {r._lastName}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset bg-amber-50 text-amber-700 ring-amber-200">
                          {RETURN_STATUS_LABEL[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600">{RES_LABEL[r.resolution] ?? r.resolution ?? "—"}</td>
                      <td className="px-3 py-3 text-xs text-slate-500 max-w-48">
                        <span className="line-clamp-3">{r.reason || "—"}</span>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600 max-w-44">
                        {r.items.length > 0
                          ? r.items.map((i) => (
                              <div key={i.productName} className="flex items-baseline gap-1">
                                <span className="font-medium">{i.productName}</span>
                                <span className="text-slate-400">×{i.quantity}</span>
                              </div>
                            ))
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3 py-3 text-xs space-y-1 min-w-32">
                        {r.refunds.length > 0
                          ? r.refunds.map((rf, rfi) => (
                              <div key={rfi} className="flex items-center gap-1.5">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  rf.status === "PROCESSED" ? "bg-green-100 text-green-700"
                                  : rf.status === "FAILED"  ? "bg-red-100 text-red-600"
                                  : "bg-amber-50 text-amber-700"
                                }`}>{REFUND_STATUS_LABEL[rf.status] ?? rf.status}</span>
                                <span className="font-medium tabular-nums">{fmtCOP(rf.amount)}</span>
                                {rf.method && <span className="text-slate-400">{rf.method}</span>}
                              </div>
                            ))
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3 py-3">
                        {r.registeredBy
                          ? <div><p className="text-xs font-medium text-slate-700">{r.registeredBy.name}</p><p className="text-[10px] text-slate-400">{r.registeredBy.email}</p></div>
                          : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-400 tabular-nums whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination
            page={returnPage}
            pageSize={PAGE_SIZE}
            totalItems={allReturns.length}
            onPageChange={setReturnPage}
          />
        </ReportSection>
      )}

    </div>
  );
}
