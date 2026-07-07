import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import noPhotos from "@/assets/icons/no-fotos.png";

export default function ProductBundleDetailDialog({ item }) {
  const [open, setOpen] = useState(false);

  const items = item.items || [];

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 text-indigo-500 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del combo</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-1">
            {/* Imagen */}
            <div
              className="flex items-center justify-center rounded-xl border border-slate-100 bg-white h-40 overflow-hidden"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
                backgroundSize: "16px 16px",
              }}
            >
              <img
                src={item.mainImage ? `${import.meta.env.VITE_API_URL}${item.mainImage}` : noPhotos}
                alt={item.name}
                className="max-h-28 max-w-[70%] object-contain drop-shadow-sm"
              />
            </div>

            {/* Datos */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Nombre</span>
                <span className="text-slate-800 font-semibold">{item.name}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Estado</span>
                <Badge
                  variant="outline"
                  className={`w-fit text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                    item.isActive
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {item.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Precio</span>
                <span className="text-slate-800 font-semibold">
                  ${Number(item.price).toLocaleString("es-CO")} COP
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Slug</span>
                <span className="text-slate-600 font-mono text-xs">/{item.slug}</span>
              </div>

              <div className="col-span-2 flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Descripción</span>
                <span className="text-slate-600 leading-relaxed">{item.description || "Sin descripción"}</span>
              </div>

              <div className="col-span-2 flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">
                  Productos incluidos ({items.length})
                </span>
                <div className="flex flex-col gap-1.5">
                  {items.map((bi) => {
                    const isFixed = !!bi.productVariantId;
                    const variantLabel = isFixed
                      ? (bi.productVariant?.attributes ?? [])
                          .map((a) => a.attributeValue?.value)
                          .filter(Boolean)
                          .join(" · ") || bi.productVariant?.sku || "Variante fija"
                      : null;
                    return (
                      <div
                        key={bi.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-1.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-slate-700">{bi.product?.name ?? "Producto eliminado"}</p>
                          <p className="text-[10px] text-slate-400">
                            {isFixed ? `Fija: ${variantLabel}` : "El cliente elige la variante"}
                          </p>
                        </div>
                        <span className="shrink-0 text-slate-500 font-medium">× {bi.quantity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
