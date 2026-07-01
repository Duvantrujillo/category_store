import { Eye, Trash } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter } from "@/components/ui/card";
import ProductVariantEditDialog from "@/pages/dashboard/admin/product-variant/components/product-variant-update/ProductVariantEditDialog";
import { useHasPermission } from "@/lib/permissions";

function ProductVariantCard({ item, onDelete, onDetails, onRefresh, attributes = [] }) {
  const canUpdate = useHasPermission("product-variants.update");
  const canDelete = useHasPermission("product-variants.delete");
  const firstImage = item.images?.[0]?.imageUrl
    ? `${import.meta.env.VITE_API_URL}${item.images[0].imageUrl}`
    : noPhotos;

  return (
    <Card className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">

      {/* Imagen */}
      <div className="relative overflow-hidden bg-slate-100 h-40 shrink-0">
        <img
          src={firstImage}
          alt={item.sku || "Variante"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge variant="outline" className={`absolute top-2 left-2 text-[10px] px-1.5 py-0 rounded-full font-semibold border backdrop-blur-sm ${
          item.isActive
            ? "bg-green-50/90 text-green-700 border-green-200"
            : "bg-red-50/90 text-red-600 border-red-200"
        }`}>
          {item.isActive ? "Activo" : "Inactivo"}
        </Badge>
        {item.isDefault && (
          <Badge variant="outline" className="absolute top-2 right-2 text-[10px] px-1.5 py-0 rounded-full font-semibold border bg-indigo-50/90 text-indigo-600 border-indigo-200 backdrop-blur-sm">
            Principal
          </Badge>
        )}
      </div>

      {/* Datos apilados */}
      <div className="px-4 py-3 flex flex-col divide-y divide-slate-100 flex-1">
        <div className="flex items-center justify-between py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">SKU</span>
          <span className="text-xs font-medium text-slate-700 break-all text-right">{item.sku || "—"}</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Código</span>
          <span className="text-xs font-medium text-slate-700 truncate max-w-[60%] text-right">{item.barcode || "—"}</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Stock</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            item.stock > 0 ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-500"
          }`}>{item.stock} uds.</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Precio</span>
          <span className="text-sm font-bold text-slate-800">${Number(item.price).toLocaleString()}</span>
        </div>
      </div>

      {/* Acciones */}
      <CardFooter className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-1.5">
        <Button variant="outline" size="icon" className="h-7 w-7 text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => onDetails(item)}>
          <Eye className="h-3 w-3" />
        </Button>
        <ProductVariantEditDialog item={item} onRefresh={onRefresh} attributes={attributes} disabled={!canUpdate} />
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 text-rose-500 border-rose-200 hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none"
          onClick={() => onDelete(item.id)}
          disabled={!canDelete}
          title={!canDelete ? "Sin permiso para eliminar variantes" : undefined}
        >
          <Trash className="h-3 w-3" />
        </Button>
      </CardFooter>

    </Card>
  );
}

export default ProductVariantCard;
