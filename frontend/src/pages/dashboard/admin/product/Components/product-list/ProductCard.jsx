import { Eye, Trash } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ProductEditDialog from "@/pages/dashboard/admin/product/Components/product-update/ProductEditDialog";
import { useHasPermission } from "@/lib/permissions";

const statusConfig = {
  ACTIVE:   { label: "Activo",   cls: "bg-green-50 text-green-700 border-green-200" },
  INACTIVE: { label: "Inactivo", cls: "bg-red-50 text-red-600 border-red-200" },
  DRAFT:    { label: "Borrador", cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

function ProductCard({ item, onDelete, onDetails, onRefresh }) {
  const canUpdate = useHasPermission("products.update");
  const canDelete = useHasPermission("products.delete");
  const { label, cls } = statusConfig[item.status] ?? { label: item.status, cls: "bg-slate-100 text-slate-600 border-slate-200" };

  return (
    <Card className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">

      {/* Imagen */}
      <div className="relative overflow-hidden bg-slate-100 h-44">
        <img
          src={item.mainImage ? `${import.meta.env.VITE_API_URL}${item.mainImage}` : noPhotos}
          alt={item.name || "Sin imagen"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2.5 left-2.5">
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border backdrop-blur-sm ${cls}`}>
            {label}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <CardContent className="flex flex-col gap-1.5 px-4 pt-3 pb-2 flex-1">
        <p className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">{item.name}</p>
        <p className="text-[11px] text-slate-400 truncate">/{item.slug}</p>

        <div className="flex flex-wrap gap-1.5 mt-1">
          {item.category?.name && (
            <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {item.category.name}
            </span>
          )}
          {item.brand?.name && (
            <span className="text-[10px] font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
              {item.brand.name}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-0.5">
            {item.description}
          </p>
        )}
      </CardContent>

      {/* Acciones */}
      <CardFooter className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          onClick={() => onDetails(item)}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
        <ProductEditDialog item={item} onRefresh={onRefresh} disabled={!canUpdate} />
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

export default ProductCard;
