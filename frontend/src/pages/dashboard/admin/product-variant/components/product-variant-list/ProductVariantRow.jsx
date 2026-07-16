import { Trash } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import ProductVariantEditDialog from "@/pages/dashboard/admin/product-variant/components/product-variant-update/ProductVariantEditDialog";
import { useHasPermission } from "@/lib/permissions";
import { getVariantImage } from "@/lib/media";

function ProductVariantRow({ item, onDelete, onRefresh, products = [], attributes = [] }) {
  const canUpdate = useHasPermission("product-variants.update");
  const canDelete = useHasPermission("product-variants.delete");
  const rawImg = getVariantImage(item);
  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors">

      {/* Imagen */}
      <TableCell className="px-4 py-3">
        <div className="flex justify-center">
          <img
            src={rawImg ? `${import.meta.env.VITE_API_URL}${rawImg}` : noPhotos}
            alt={item.sku || "Sin imagen"}
            className="h-10 w-10 rounded-lg object-cover border border-slate-200 shadow-sm"
          />
        </div>
      </TableCell>

      {/* SKU */}
      <TableCell className="text-center px-4 py-3 max-w-40">
        <div className="flex flex-col items-center">
          <span className="font-medium text-slate-800 break-all whitespace-normal">{item.sku}</span>
          <small className="text-slate-400 break-all whitespace-normal">{item.barcode || "Sin código"}</small>
        </div>
      </TableCell>

      {/* Precio */}
      <TableCell className="text-center px-4 py-3 font-medium text-slate-800">
        ${Number(item.price).toLocaleString()}
      </TableCell>

      {/* Stock */}
      <TableCell className="text-center px-4 py-3 text-slate-600">
        {item.stock}
      </TableCell>

      {/* Principal */}
      <TableCell className="text-center px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.isDefault ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
        }`}>
          {item.isDefault ? "Principal" : "Secundaria"}
        </span>
      </TableCell>

      {/* Estado */}
      <TableCell className="text-center px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {item.isActive ? "Activo" : "Inactivo"}
        </span>
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <ProductVariantEditDialog
            item={item}
            onRefresh={onRefresh}
            products={products}
            attributes={attributes}
            disabled={!canUpdate}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none"
            disabled={!canDelete}
            title={!canDelete ? "Sin permiso para eliminar variantes" : undefined}
            onClick={() => onDelete(item.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>

    </TableRow>
  );
}

export default ProductVariantRow;
