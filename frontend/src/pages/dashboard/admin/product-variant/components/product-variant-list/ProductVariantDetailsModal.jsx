import noPhotos from "@/assets/icons/no-fotos.png";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Package, Barcode, Hash } from "lucide-react";

function SectionTitle({ children }) {
  return (
    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-3">{children}</p>
  );
}

function StatCard({ icon: Icon, label, value, accent = "slate" }) {
  const colors = {
    slate:  "bg-slate-50 border-slate-100 text-slate-500",
    green:  "bg-green-50 border-green-100 text-green-600",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
  };
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${colors[accent]}`}>
      <div className={`flex items-center justify-center h-8 w-8 rounded-full bg-white border ${colors[accent]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider font-semibold opacity-60">{label}</p>
        <p className="text-sm font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function ProductVariantDetailsModal({ open, onClose, variant }) {
  if (!variant) return null;

  const images = Array.isArray(variant.images)
    ? [...variant.images].sort((a, b) => a.slot - b.slot)
    : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl gap-0">

        {/* ── Sección 1: Imágenes ── */}
        <div className="px-5 pt-5 pb-4 space-y-3">
          <DialogTitle className="text-base font-semibold text-slate-800">
            Detalles de la variante
          </DialogTitle>

          <SectionTitle>Imágenes ({images.length})</SectionTitle>

          {images.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img) => (
                <div key={img.id} className="shrink-0 relative group/img">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${img.imageUrl}`}
                    alt={`Slot ${img.slot}`}
                    className="h-24 w-24 object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                  <span className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                    {img.slot}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24 rounded-xl bg-slate-50 border border-dashed border-slate-200">
              <img src={noPhotos} alt="Sin imágenes" className="h-12 w-12 object-contain opacity-30" />
            </div>
          )}
        </div>

        <Separator className="bg-slate-100" />

        {/* ── Sección 2: Precio y Stock ── */}
        <div className="px-5 py-4 space-y-3">
          <SectionTitle>Precio y stock</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={DollarSign} label="Precio" value={`$${Number(variant.price).toLocaleString()}`} accent="green" />
            <StatCard icon={Package}    label="Stock"  value={variant.stock}  accent="indigo" />
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* ── Sección 3: Identificación ── */}
        <div className="px-5 py-4 space-y-3">
          <SectionTitle>Identificación</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Hash}    label="SKU"              value={variant.sku     || "Sin SKU"}     />
            <StatCard icon={Barcode} label="Código de barras" value={variant.barcode || "Sin código"} />
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* ── Sección 4: Atributos ── */}
        <div className="px-5 py-4 space-y-3">
          <SectionTitle>Atributos</SectionTitle>
          {variant.attributes?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {variant.attributes.map((a) => (
                <div key={a.id} className="flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded-full px-3 py-1">
                  {a.attributeValue?.attribute?.name && (
                    <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">
                      {a.attributeValue.attribute.name}:
                    </span>
                  )}
                  <span className="text-xs font-medium text-violet-700">
                    {a.attributeValue?.value ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Sin atributos.</p>
          )}
        </div>

        <Separator className="bg-slate-100" />

        {/* ── Sección 5: Estado ── */}
        <div className="px-5 py-4 pb-5 space-y-3">
          <SectionTitle>Estado</SectionTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={`text-xs px-3 py-1 rounded-full font-semibold border ${
              variant.isActive
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-600 border-red-200"
            }`}>
              {variant.isActive ? "Activo" : "Inactivo"}
            </Badge>
            <Badge variant="outline" className={`text-xs px-3 py-1 rounded-full font-semibold border ${
              variant.isDefault
                ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}>
              {variant.isDefault ? "Variante principal" : "Variante secundaria"}
            </Badge>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
