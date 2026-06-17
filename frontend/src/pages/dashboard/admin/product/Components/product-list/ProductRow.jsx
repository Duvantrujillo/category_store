import { Trash } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import ProductEditDialog from "@/pages/dashboard/admin/product/Components/product-update/ProductEditDialog";

const statusConfig = {
  ACTIVE:   { label: "Activo",   cls: "bg-green-100 text-green-700" },
  INACTIVE: { label: "Inactivo", cls: "bg-red-100 text-red-700" },
  DRAFT:    { label: "Borrador", cls: "bg-amber-100 text-amber-700" },
};

function ProductRow({ item, onDelete, onRefresh }) {
  const { label, cls } = statusConfig[item.status] ?? { label: item.status, cls: "bg-slate-100 text-slate-700" };

  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors">

      {/* Imagen */}
      <TableCell className="px-4 py-3">
        <div className="flex justify-center">
          <img
            src={item.mainImage ? `${import.meta.env.VITE_API_URL}${item.mainImage}` : noPhotos}
            alt={item.name || "Sin imagen"}
            className="h-10 w-10 rounded-lg object-cover border border-slate-200 shadow-sm"
          />
        </div>
      </TableCell>

      {/* Producto */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex flex-col items-center">
          <span className="font-medium text-slate-800">{item.name}</span>
          <small className="text-slate-400">{item.slug}</small>
        </div>
      </TableCell>

      {/* Categoría */}
      <TableCell className="text-center px-4 py-3 text-slate-600">
        {item.category?.name || "—"}
      </TableCell>

      {/* Marca */}
      <TableCell className="text-center px-4 py-3 text-slate-600">
        {item.brand?.name || "—"}
      </TableCell>

      {/* Estado publicación */}
      <TableCell className="text-center px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
          {label}
        </span>
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <ProductEditDialog item={item} onRefresh={onRefresh} />
          <Button
            variant="ghost"
            size="icon"
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
            onClick={() => onDelete(item.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>

    </TableRow>
  );
}

export default ProductRow;
