import {
  FileText, Gift, DollarSign, RotateCcw, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_CONFIG = {
  active:    { label: "Activo",     cls: "bg-green-500/20 text-green-300 border-green-500/30" },
  scheduled: { label: "Programado", cls: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  expired:   { label: "Expirado",   cls: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  paused:    { label: "Pausado",    cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  draft:     { label: "Borrador",   cls: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
};

export function getStatusKey(item) {
  const now = new Date();
  const start = new Date(item.startsAt);
  const end = new Date(item.expiresAt);
  if (item.status === "PAUSED") return "paused";
  if (item.status === "DRAFT") return "draft";
  if (now > end) return "expired";
  if (now < start) return "scheduled";
  return "active";
}

export function getGiftVariantLabel(item) {
  const variant = item.productVariant;
  if (!variant) return "—";
  const attrs = (variant.attributes ?? [])
    .map((a) => a.attributeValue?.value)
    .filter(Boolean)
    .join(" · ");
  const productName = variant.product?.name ?? "Producto";
  return attrs ? `${productName} (${attrs})` : productName;
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

function PurchaseGiftDetailsDialog({ open, item, onClose }) {
  if (!item) return null;

  const { label: statusLabel, cls: statusCls } = STATUS_CONFIG[getStatusKey(item)];
  const usedCount = item._count?.usages ?? 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl">

        {/* Header */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 px-6 py-5">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-white text-lg font-bold tracking-tight leading-none">
                  {item.name}
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-sm mt-1">
                  Detalle del regalo por monto de compra
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
            <Field
              icon={Gift}
              label="Producto obsequiado"
              value={`${getGiftVariantLabel(item)} × ${item.quantity}`}
              iconCls="bg-red-50 text-red-500"
            />
            <Field
              icon={DollarSign}
              label="Compra mínima"
              value={`$${Number(item.minimumPurchase).toLocaleString("es-CO")}`}
              iconCls="bg-sky-50 text-sky-500"
            />
            <Field
              icon={RotateCcw}
              label="Usos"
              value={item.usageLimit ? `${usedCount} / ${item.usageLimit}` : `${usedCount} / Ilimitado`}
              iconCls="bg-violet-50 text-violet-500"
            />
            <Field
              icon={Calendar}
              label="Vigencia"
              value={`${new Date(item.startsAt).toLocaleDateString("es-CO")} — ${new Date(item.expiresAt).toLocaleDateString("es-CO")}`}
              iconCls="bg-indigo-50 text-indigo-500"
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

export default PurchaseGiftDetailsDialog;
