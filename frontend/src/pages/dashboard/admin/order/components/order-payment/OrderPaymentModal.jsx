import {
  CreditCard, DollarSign, Building2,
  Hash, Calendar, CheckCircle2, Clock, XCircle, AlertCircle, Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const STATUS_CONFIG = {
  APPROVED: { label: "Aprobado", icon: CheckCircle2, cls: "bg-green-500/20 text-green-300 border-green-500/30",  rowCls: "bg-green-50  border-green-200  text-green-700"  },
  PENDING:  { label: "Pendiente", icon: Clock,        cls: "bg-amber-500/20 text-amber-300 border-amber-500/30",  rowCls: "bg-amber-50  border-amber-200  text-amber-700"  },
  DECLINED: { label: "Rechazado", icon: XCircle,      cls: "bg-red-500/20   text-red-300   border-red-500/30",    rowCls: "bg-red-50    border-red-200    text-red-700"    },
  ERROR:    { label: "Error",     icon: AlertCircle,  cls: "bg-red-500/20   text-red-300   border-red-500/30",    rowCls: "bg-red-50    border-red-200    text-red-700"    },
  VOIDED:   { label: "Anulado",  icon: Ban,          cls: "bg-slate-500/20 text-slate-300 border-slate-500/30", rowCls: "bg-slate-50 border-slate-200 text-slate-600" },
};

const fmtCOP = (n) => `$${Number(n ?? 0).toLocaleString("es-CO")}`;

const Row = ({ label, value, mono }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-500 shrink-0">{label}</span>
    <span className={`text-sm font-medium text-slate-800 text-right ${mono ? "font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md wrap-break-word max-w-xs" : ""}`}>
      {value || <span className="text-slate-400 italic font-normal">N/A</span>}
    </span>
  </div>
);

function OrderPaymentModal({ open, order, onClose }) {
  if (!order) return null;

  const payment = order.payment;
  const cfg = payment ? (STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.PENDING) : null;
  const StatusIcon = cfg?.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl">

        {/* Header */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 px-6 py-5">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-white text-lg font-bold tracking-tight leading-none">
                  Información del pago
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-sm mt-1">
                  Orden {order.orderNumber}
                </DialogDescription>
              </div>
              {cfg && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${cfg.cls}`}>
                  <StatusIcon size={11} />
                  {cfg.label}
                </span>
              )}
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4 bg-slate-50">

          {!payment ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <CreditCard size={36} className="opacity-30 mb-3" />
              <p className="text-sm">Esta orden no tiene información de pago registrada.</p>
            </div>
          ) : (
            <>
              {/* Banner de monto */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600">Monto del pago</p>
                    <p className="text-2xl font-bold text-emerald-800 tabular-nums leading-none mt-0.5">{fmtCOP(payment.amount)}</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-medium">{payment.currency}</p>
              </div>

              {/* Estado */}
              {cfg && (
                <div className={`rounded-xl border px-4 py-3 flex items-center gap-2 ${cfg.rowCls}`}>
                  <StatusIcon size={14} />
                  <span className="text-sm font-semibold">{cfg.label}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* Info general */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <Building2 size={12} className="text-slate-400" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Proveedor y método</p>
                  </div>
                  <div className="px-4 py-1">
                    <Row label="Proveedor"     value={payment.provider} />
                    <Row label="Método"        value={payment.paymentMethod} />
                    <Row label="Moneda"        value={payment.currency} />
                  </div>
                </div>

                {/* Fechas */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <Calendar size={12} className="text-slate-400" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Fechas</p>
                  </div>
                  <div className="px-4 py-1">
                    <Row label="Creado"       value={new Date(payment.createdAt).toLocaleString("es-CO")} />
                    <Row label="Actualizado"  value={new Date(payment.updatedAt).toLocaleString("es-CO")} />
                  </div>
                </div>

              </div>

              {/* Referencias */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <Hash size={12} className="text-slate-400" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Referencias</p>
                </div>
                <div className="px-4 py-1">
                  <Row label="Referencia"      value={payment.reference}     mono />
                  <Row label="Transaction ID"  value={payment.transactionId} mono />
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cerrar
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

export default OrderPaymentModal;
