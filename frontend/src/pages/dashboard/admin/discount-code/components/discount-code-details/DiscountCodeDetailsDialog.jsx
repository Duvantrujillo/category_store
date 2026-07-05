import {
  FileText, TicketPercent, DollarSign, Layers, RotateCcw, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Costo de envío estándar aplicado en el checkout — mismo valor usado en
// frontend/src/pages/public/Checkout/Checkout.jsx y en el backend.
const SHIPPING_COST = 11000;

const TYPE_LABEL = {
  PERCENTAGE: "Porcentaje",
  FIXED: "Monto fijo",
  FREE_SHIPPING: "Envío gratis",
};

const STATUS_CONFIG = {
  active:    { label: "Activo",     cls: "bg-green-500/20 text-green-300 border-green-500/30" },
  scheduled: { label: "Programado", cls: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  expired:   { label: "Expirado",   cls: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  inactive:  { label: "Inactivo",   cls: "bg-red-500/20 text-red-300 border-red-500/30" },
};

function getStatusKey(item) {
  const now = new Date();
  const start = new Date(item.startsAt);
  const end = new Date(item.expiresAt);
  if (!item.isActive) return "inactive";
  if (now < start) return "scheduled";
  if (now > end) return "expired";
  return "active";
}

export function formatDiscountValue(item) {
  if (item.type === "PERCENTAGE") return `${Number(item.value)}%`;
  if (item.type === "FIXED") return `$${Number(item.value).toLocaleString("es-CO")}`;
  return `$${SHIPPING_COST.toLocaleString("es-CO")} (envío)`;
}

function getRestrictionsList(item) {
  const parts = [];
  if (item.products?.length) parts.push(...item.products.map((p) => p.product?.name).filter(Boolean));
  if (item.categories?.length) parts.push(...item.categories.map((c) => `Categoría ${c.category?.name}`).filter(Boolean));
  if (item.brands?.length) parts.push(...item.brands.map((b) => `Marca ${b.brand?.name}`).filter(Boolean));
  return parts;
}

const Field = ({ icon: Icon, label, value, iconCls = "bg-slate-100 text-slate-500" }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${iconCls}`}>
      <Icon size={13} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 leading-none mb-1">{label}</p>
      <p className="text-sm text-slate-800 font-medium leading-snug">{value}</p>
    </div>
  </div>
);

function DiscountCodeDetailsDialog({ open, item, onClose }) {
  if (!item) return null;

  const { label: statusLabel, cls: statusCls } = STATUS_CONFIG[getStatusKey(item)];
  const usedCount = item._count?.usages ?? 0;
  const restrictions = getRestrictionsList(item);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl">

        {/* Header */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 px-6 py-5">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-white text-lg font-bold tracking-tight leading-none font-mono">
                  {item.code}
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-sm mt-1">
                  Detalle del cupón de descuento
                </DialogDescription>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${statusCls}`}>
                {statusLabel}
              </span>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto bg-slate-50">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden px-4 py-1">
            {item.description && (
              <Field icon={FileText} label="Descripción" value={item.description} iconCls="bg-slate-100 text-slate-500" />
            )}
            <Field icon={TicketPercent} label="Tipo" value={TYPE_LABEL[item.type] ?? item.type} iconCls="bg-indigo-50 text-indigo-500" />
            <Field icon={DollarSign} label="Valor" value={formatDiscountValue(item)} iconCls="bg-emerald-50 text-emerald-500" />
            <Field
              icon={DollarSign}
              label="Compra mínima"
              value={Number(item.minimumPurchase) > 0
                ? `$${Number(item.minimumPurchase).toLocaleString("es-CO")}`
                : "Cualquier compra"}
              iconCls="bg-sky-50 text-sky-500"
            />
            <Field
              icon={RotateCcw}
              label="Usos"
              value={item.maxUses ? `${usedCount} / ${item.maxUses}` : `${usedCount} / Ilimitado`}
              iconCls="bg-violet-50 text-violet-500"
            />
            <Field
              icon={Calendar}
              label="Vigencia"
              value={`${new Date(item.startsAt).toLocaleDateString("es-CO")} — ${new Date(item.expiresAt).toLocaleDateString("es-CO")}`}
              iconCls="bg-amber-50 text-amber-500"
            />
            <Field
              icon={Layers}
              label="Aplica a"
              value={restrictions.length ? restrictions.join(", ") : "Todo el catálogo"}
              iconCls="bg-rose-50 text-rose-500"
            />
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

export default DiscountCodeDetailsDialog;
