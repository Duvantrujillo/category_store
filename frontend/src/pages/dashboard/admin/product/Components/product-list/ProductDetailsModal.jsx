import noPhotos from "@/assets/icons/no-fotos.png";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tag, Layers } from "lucide-react";

const statusConfig = {
  ACTIVE:   { label: "Activo",   cls: "bg-green-50 text-green-700 border-green-200" },
  INACTIVE: { label: "Inactivo", cls: "bg-red-50 text-red-600 border-red-200" },
  DRAFT:    { label: "Borrador", cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function ProductDetailsModal({ open, onClose, product }) {
  if (!product) return null;

  const { label, cls } = statusConfig[product.status] ?? { label: product.status, cls: "bg-slate-100 text-slate-600 border-slate-200" };
  const imageSrc = product.mainImage
    ? `${import.meta.env.VITE_API_URL}${product.mainImage}`
    : noPhotos;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl gap-0">

        {/* Hero imagen */}
        <div className="relative h-52 bg-slate-100 overflow-hidden shrink-0">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

          {/* Nombre + badge sobre la imagen */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 flex items-end justify-between gap-3">
            <DialogTitle className="text-white text-lg font-bold leading-snug drop-shadow-sm line-clamp-2 flex-1">
              {product.name}
            </DialogTitle>
            <Badge variant="outline" className={`shrink-0 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border backdrop-blur-sm ${cls}`}>
              {label}
            </Badge>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="px-5 py-4 space-y-4">

          {/* Categoría + Marca */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-3">
              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-white border border-slate-200 shrink-0 mt-0.5">
                <Layers className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Categoría</p>
                <p className="text-sm font-medium text-slate-700 truncate mt-0.5">
                  {product.category?.name ?? <span className="text-slate-400 font-normal italic">Sin categoría</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-3">
              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-white border border-slate-200 shrink-0 mt-0.5">
                <Tag className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Marca</p>
                <p className="text-sm font-medium text-slate-700 truncate mt-0.5">
                  {product.brand?.name ?? <span className="text-slate-400 font-normal italic">Sin marca</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-2">Descripción</p>
            {product.description ? (
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">Sin descripción.</p>
            )}
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
