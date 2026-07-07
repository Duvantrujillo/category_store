import { Trash } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ProductBundleEditDialog from "@/pages/dashboard/admin/product-bundle/components/product-bundle-update/ProductBundleEditDialog";
import ProductBundleDetailDialog from "@/pages/dashboard/admin/product-bundle/components/product-bundle-detail/ProductBundleDetailDialog";
import { useHasPermission } from "@/lib/permissions";

function ProductBundleCard({ item, onDelete, onRefresh }) {
  const canUpdate = useHasPermission("bundles.update");
  const canDelete = useHasPermission("bundles.delete");
  const itemsCount = item.items?.length ?? 0;

  return (
    <Card className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">

      {/* Imagen */}
      <div className="relative flex items-center justify-center bg-white border-b border-slate-100 h-36 overflow-hidden">
        <div className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        />
        <img
          src={item.mainImage ? `${import.meta.env.VITE_API_URL}${item.mainImage}` : noPhotos}
          alt={item.name || "Sin imagen"}
          className="relative z-10 max-h-24 max-w-[75%] w-auto object-contain drop-shadow-sm"
        />
        <span className="absolute top-2 left-2 z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-slate-600 border border-slate-200">
          {itemsCount} producto{itemsCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Info */}
      <CardContent className="flex flex-col gap-2 px-4 pt-4 pb-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
            <p className="text-[11px] text-slate-400 truncate">/{item.slug}</p>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium border ${
              item.isActive
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-600 border-red-200"
            }`}
          >
            {item.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        <p className="text-sm font-semibold text-slate-700">
          ${Number(item.price).toLocaleString("es-CO")} <span className="text-[11px] font-normal text-slate-400">COP</span>
        </p>

      </CardContent>

      {/* Acciones */}
      <CardFooter className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-1.5">
        <ProductBundleDetailDialog item={item} />
        <ProductBundleEditDialog item={item} onRefresh={onRefresh} disabled={!canUpdate} />
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-rose-500 border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 disabled:pointer-events-none"
          onClick={() => onDelete(item.id)}
          disabled={!canDelete}
          title={!canDelete ? "Sin permiso para eliminar" : undefined}
        >
          <Trash className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>

    </Card>
  );
}

export default ProductBundleCard;
