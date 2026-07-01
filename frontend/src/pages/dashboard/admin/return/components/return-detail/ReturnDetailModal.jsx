import {
  CheckCircle2, Clock, XCircle, Package,
  MessageSquare, User, BadgeDollarSign,
  ShoppingBag, AlertCircle, Truck,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

/* ─── helpers ─────────────────────────────────────────────── */
const fmtCOP  = (n) => `$${Number(n ?? 0).toLocaleString("es-CO")}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : null;

/* ─── status timeline ──────────────────────────────────────── */
const TIMELINE_STEPS = [
  {
    key:   "PENDING",
    label: "Pendiente",
    desc:  "Solicitud creada, esperando revisión",
  },
  {
    key:   "RECEIVED",
    label: "Recibida",
    desc:  "El producto fue recibido y se está verificando",
  },
  {
    key:   "APPROVED",
    label: "Aprobada",
    desc:  "La devolución fue aprobada y se procesa la resolución",
    altKey:   "REJECTED",
    altLabel: "Rechazada",
    altDesc:  "La solicitud fue revisada y no cumple los criterios",
  },
  {
    key:   "COMPLETED",
    label: "Completada",
    desc:  "Proceso finalizado correctamente",
  },
];

const STATUS_ORDER = { PENDING: 0, RECEIVED: 1, APPROVED: 2, REJECTED: 2, COMPLETED: 3 };

const RESOLUTION_LABEL = {
  REFUND:       "Reembolso",
  EXCHANGE:     "Cambio",
  STORE_CREDIT: "Crédito tienda",
};

const RESOLUTION_CLS = {
  REFUND:       "bg-emerald-100 text-emerald-700 border-emerald-200",
  EXCHANGE:     "bg-blue-100 text-blue-700 border-blue-200",
  STORE_CREDIT: "bg-violet-100 text-violet-700 border-violet-200",
};

const REFUND_STATUS = {
  PENDING:   { label: "Pendiente de pago", cls: "bg-amber-50 text-amber-700 border-amber-200",  Icon: Clock         },
  PROCESSED: { label: "Pagado",            cls: "bg-green-50 text-green-700 border-green-200",  Icon: CheckCircle2  },
  FAILED:    { label: "Fallido",           cls: "bg-red-50 text-red-700 border-red-200",        Icon: AlertCircle   },
};

/* ─── sub-components ───────────────────────────────────────── */
function SectionLabel({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
        <Icon size={12} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{text}</p>
    </div>
  );
}

function InfoPair({ label, value, mono }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0 gap-4">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <span className={`text-xs font-medium text-slate-800 text-right ${mono ? "font-mono bg-slate-100 px-1.5 py-0.5 rounded" : ""}`}>
        {value}
      </span>
    </div>
  );
}

/* ─── timeline ─────────────────────────────────────────────── */
function StatusTimeline({ status }) {
  const currentIdx  = STATUS_ORDER[status] ?? 0;
  const isRejected  = status === "REJECTED";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <SectionLabel icon={Clock} text="Estado de la solicitud" />

      <div className="flex items-start gap-0">
        {TIMELINE_STEPS.map((step, i) => {
          const useAlt  = isRejected && step.altKey === "REJECTED" && i === 2;
          const label   = useAlt ? step.altLabel : step.label;
          const desc    = useAlt ? step.altDesc  : step.desc;
          const isDone  = i < currentIdx;
          const isActive = i === currentIdx;
          const isLast  = i === TIMELINE_STEPS.length - 1;

          let dotCls, lineCls, labelCls;
          if (isDone) {
            dotCls   = "bg-blue-600 border-blue-600 text-white";
            lineCls  = "bg-blue-500";
            labelCls = "text-blue-700";
          } else if (isActive && useAlt) {
            dotCls   = "bg-red-500 border-red-500 text-white";
            lineCls  = "bg-slate-200";
            labelCls = "text-red-600";
          } else if (isActive) {
            dotCls   = "bg-indigo-600 border-indigo-600 text-white";
            lineCls  = "bg-slate-200";
            labelCls = "text-indigo-700";
          } else {
            dotCls   = "bg-white border-slate-300 text-slate-300";
            lineCls  = "bg-slate-200";
            labelCls = "text-slate-400";
          }

          return (
            <div key={step.key} className="flex flex-col items-center flex-1 min-w-0">
              {/* dot + line */}
              <div className="flex items-center w-full">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${dotCls}`}>
                  {isDone
                    ? <CheckCircle2 size={13} />
                    : isActive && useAlt
                    ? <XCircle size={13} />
                    : isActive
                    ? <Clock size={11} />
                    : <span className="text-[10px] font-bold">{i + 1}</span>
                  }
                </div>
                {!isLast && <div className={`flex-1 h-0.5 ${lineCls}`} />}
              </div>

              {/* label + desc */}
              <div className="mt-2 px-0.5 w-full">
                <p className={`text-[11px] font-bold leading-tight ${labelCls}`}>{label}</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5 hidden sm:block">{desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── main modal ───────────────────────────────────────────── */
export default function ReturnDetailModal({ open, item, onClose }) {
  if (!item) return null;

  const refund      = item.refunds?.[0];
  const refundCfg   = refund ? (REFUND_STATUS[refund.status] ?? REFUND_STATUS.PENDING) : null;
  const RefundIcon  = refundCfg?.Icon;

  const itemsSubtotal = item.items?.reduce(
    (sum, ri) => sum + Number(ri.orderItem.unitPrice) * ri.quantity, 0
  ) ?? 0;

  // Si ya existe un reembolso, usar su monto real (puede incluir envío)
  const totalAmount    = refund ? Number(refund.amount) : itemsSubtotal;
  const shippingInRefund = refund
    ? Math.max(0, Number(refund.amount) - itemsSubtotal)
    : item.willIncludeShipping ? Number(item.shippingCost ?? 0) : 0;

  const resLabel = item.resolution ? RESOLUTION_LABEL[item.resolution] : null;
  const resCls   = item.resolution ? RESOLUTION_CLS[item.resolution]   : "";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl">

        {/* ── Header ── */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 px-6 py-5">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-white text-lg font-bold tracking-tight leading-tight">
                  {item.order?.orderNumber
                    ? `Pedido ${item.order.orderNumber}`
                    : `Orden #${item.orderId}`}
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-sm mt-1">
                  {item.order
                    ? `${item.order.firstName} ${item.order.lastName}`
                    : "Sin información del cliente"}
                  {" · "}Solicitud #{item.id}
                </DialogDescription>
                <p className="text-slate-500 text-xs mt-1.5">
                  Creada el {fmtDate(item.createdAt) ?? "—"}
                  {item.updatedAt !== item.createdAt && fmtDate(item.updatedAt)
                    ? ` · Actualizada el ${fmtDate(item.updatedAt)}`
                    : ""}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                {resLabel && (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${resCls}`}>
                    {resLabel}
                  </span>
                )}
                {item.order?.total != null && (
                  <span className="text-xs text-slate-400">
                    Total pedido: <span className="text-white font-semibold">{fmtCOP(item.order.total)}</span>
                  </span>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 max-h-[72vh] overflow-y-auto space-y-4 bg-slate-50">

          {/* Timeline de estados */}
          <StatusTimeline status={item.status} />

          {/* Motivo */}
          {item.reason && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 shrink-0 mt-0.5">
                <MessageSquare size={13} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-1">
                  Motivo de la devolución
                </p>
                <p className="text-sm text-amber-900 leading-relaxed">{item.reason}</p>
              </div>
            </div>
          )}

          {/* Productos */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            <div className="px-4 pt-4 pb-2">
              <SectionLabel
                icon={Package}
                text={`Productos a devolver (${item.items?.length ?? 0})`}
              />
            </div>

            {item.items?.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-[10px] font-bold uppercase tracking-wide text-slate-400 pl-4">Producto</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wide text-slate-400 text-center w-16">Cant.</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wide text-slate-400 text-right w-24">P. unitario</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wide text-slate-400 text-right pr-4 w-24">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.items.map((ri) => {
                      const sub = Number(ri.orderItem.unitPrice) * ri.quantity;
                      return (
                        <TableRow key={ri.id} className="hover:bg-slate-50/50">
                          <TableCell className="pl-4 text-sm text-slate-700">{ri.orderItem.productName}</TableCell>
                          <TableCell className="text-center text-sm text-slate-600">{ri.quantity}</TableCell>
                          <TableCell className="text-right text-sm text-slate-600">{fmtCOP(ri.orderItem.unitPrice)}</TableCell>
                          <TableCell className="text-right pr-4 text-sm font-semibold text-slate-800">{fmtCOP(sub)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="border-t border-rose-100">
                  {shippingInRefund > 0 && (
                    <div className="flex items-center justify-between px-4 py-2 bg-rose-50 border-b border-rose-100">
                      <span className="text-xs text-rose-400 flex items-center gap-1">
                        <Truck size={11} /> Subtotal productos
                      </span>
                      <span className="text-sm tabular-nums text-rose-500">{fmtCOP(itemsSubtotal)}</span>
                    </div>
                  )}
                  {shippingInRefund > 0 && (
                    <div className="flex items-center justify-between px-4 py-2 bg-rose-50 border-b border-rose-100">
                      <span className="text-xs text-rose-400 flex items-center gap-1">
                        <Truck size={11} /> Envío (reembolso total)
                      </span>
                      <span className="text-sm tabular-nums text-rose-500">+{fmtCOP(shippingInRefund)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-4 py-3 bg-rose-50">
                    <span className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                      Total a {resLabel?.toLowerCase() ?? "devolver"}
                    </span>
                    <span className="text-base font-bold text-rose-700 tabular-nums">{fmtCOP(totalAmount)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 pb-5 text-slate-400">
                <ShoppingBag size={28} className="opacity-30 mb-2" />
                <p className="text-xs">Sin productos registrados en esta solicitud.</p>
              </div>
            )}
          </div>

          {/* Gestión */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <SectionLabel icon={User} text="Gestión de la solicitud" />

            <div className="space-y-3">
              {/* Registrado por */}
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Registrado por</p>
                {item.registeredBy ? (
                  <>
                    <p className="text-sm font-semibold text-slate-800">{item.registeredBy.name}</p>
                    <p className="text-xs text-slate-400">{item.registeredBy.email}</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">Sin información</p>
                )}
              </div>

              {/* Aprobado / Rechazado por */}
              <div className={`rounded-lg border px-3 py-2.5 ${
                item.status === "REJECTED"
                  ? "bg-red-50 border-red-100"
                  : item.approvedBy
                  ? "bg-blue-50 border-blue-100"
                  : "bg-slate-50 border-slate-100"
              }`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  {item.status === "REJECTED" ? "Rechazado por" : "Aprobado por"}
                </p>
                {item.approvedBy ? (
                  <>
                    <p className={`text-sm font-semibold ${item.status === "REJECTED" ? "text-red-700" : "text-blue-800"}`}>
                      {item.approvedBy.name}
                    </p>
                    <p className="text-xs text-slate-400">{item.approvedBy.email}</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">Aún no gestionada</p>
                )}
              </div>
            </div>
          </div>

          {/* Reembolso */}
          {refund && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <SectionLabel icon={BadgeDollarSign} text="Detalle del reembolso" />

              <div className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 mb-3 ${refundCfg.cls}`}>
                <RefundIcon size={14} />
                <span className="text-sm font-semibold">{refundCfg.label}</span>
              </div>

              <InfoPair label="Monto reembolsado" value={fmtCOP(totalAmount)} />
              {shippingInRefund > 0 && (
                <InfoPair label="Incluye envío" value={`+${fmtCOP(shippingInRefund)}`} />
              )}
              <InfoPair label="Método de pago"    value={refund.method} />
              <InfoPair label="Referencia"         value={refund.reference} mono />
              <InfoPair label="Fecha de pago"      value={fmtDate(refund.paidAt)} />
              <InfoPair label="Procesado por"      value={refund.processedBy?.name} />
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
