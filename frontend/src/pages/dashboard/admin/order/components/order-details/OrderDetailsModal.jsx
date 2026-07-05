import {
  User, Hash, Mail, Phone, MapPin, FileText,
  DollarSign, Receipt, Calendar, ClipboardList, Truck, TicketPercent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatMoneyCOP, formatDateTimeCO } from "@/lib/format";

const STATUS_CONFIG = {
  PAID:      { label: "Pagada",      cls: "bg-green-500/20 text-green-300 border-green-500/30" },
  PENDING:   { label: "Pendiente",   cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  CANCELLED: { label: "Cancelada",   cls: "bg-red-500/20 text-red-300 border-red-500/30" },
  REFUNDED:  { label: "Reembolsada", cls: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
};

const fmtCOP = formatMoneyCOP;

const Field = ({ icon: Icon, label, value, iconCls = "bg-slate-100 text-slate-500" }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${iconCls}`}>
      <Icon size={13} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 leading-none mb-1">{label}</p>
      <p className="text-sm text-slate-800 font-medium leading-snug">{value || <span className="text-slate-400 font-normal italic">Sin información</span>}</p>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</p>
    </div>
    <div className="px-4 py-1">
      {children}
    </div>
  </div>
);

function OrderDetailsModal({ open, order, onClose }) {
  if (!order) return null;

  const { label: statusLabel, cls: statusCls } = STATUS_CONFIG[order.status] ?? { label: order.status, cls: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
  const hasDiscount = Number(order.discountAmount) > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl">

        {/* Header */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 px-6 py-5">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-white text-lg font-bold tracking-tight leading-none">
                  Orden {order.orderNumber}
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-sm mt-1">
                  Información completa del pedido
                </DialogDescription>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${statusCls}`}>
                {statusLabel}
              </span>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-3 bg-slate-50">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Cliente */}
            <Section title="Cliente">
              <Field icon={User}  label="Nombre"    value={`${order.firstName ?? ""} ${order.lastName ?? ""}`.trim()} iconCls="bg-indigo-50 text-indigo-500" />
              <Field icon={Hash}  label="Documento" value={order.documentNumber} iconCls="bg-amber-50 text-amber-500" />
              <Field icon={Mail}  label="Email"     value={order.email || "Sin correo"} iconCls="bg-sky-50 text-sky-500" />
              <Field icon={Phone} label="Teléfono"  value={order.phoneNumber} iconCls="bg-green-50 text-green-500" />
            </Section>

            {/* Dirección */}
            <Section title="Dirección de entrega">
              <Field icon={MapPin}   label="Departamento"       value={order.departament} iconCls="bg-rose-50 text-rose-500" />
              <Field icon={MapPin}   label="Municipio"          value={order.municipality} iconCls="bg-rose-50 text-rose-500" />
              <Field icon={FileText} label="Dirección"          value={order.address} iconCls="bg-slate-100 text-slate-500" />
              <Field icon={FileText} label="Detalles adicionales" value={order.additionalDetails || "—"} iconCls="bg-slate-100 text-slate-500" />
            </Section>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Resumen financiero */}
            <Section title="Resumen financiero">
              <Field icon={DollarSign} label="Subtotal productos" value={fmtCOP(order.subtotal)} iconCls="bg-emerald-50 text-emerald-500" />
              <Field icon={Truck} label="Costo de envío" value={fmtCOP(order.shippingCost ?? 11000)} iconCls="bg-sky-50 text-sky-500" />
              {hasDiscount && (
                <Field
                  icon={TicketPercent}
                  label="Descuento aplicado"
                  value={`-${fmtCOP(order.discountAmount)} · cupón ${order.discountCode?.code ?? ""}`}
                  iconCls="bg-rose-50 text-rose-500"
                />
              )}
              <div className="flex items-start gap-3 py-2.5">
                <div className="p-1.5 rounded-lg shrink-0 mt-0.5 bg-emerald-100 text-emerald-600">
                  <Receipt size={13} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 leading-none mb-1">Total cobrado</p>
                  <p className="text-xl font-bold text-emerald-700 tabular-nums">{fmtCOP(order.total)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{order.currency}</p>
                </div>
              </div>
            </Section>

            {/* Información del pedido */}
            <Section title="Información del pedido">
              <Field icon={ClipboardList} label="Número de orden" value={order.orderNumber} iconCls="bg-violet-50 text-violet-500" />
              <Field icon={Calendar}      label="Fecha de creación" value={formatDateTimeCO(order.createdAt)} iconCls="bg-slate-100 text-slate-500" />
            </Section>

          </div>

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

export default OrderDetailsModal;
