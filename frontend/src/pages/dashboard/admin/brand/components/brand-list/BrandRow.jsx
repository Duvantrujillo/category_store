import { Trash } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import BrandEditDialog from "@/pages/dashboard/admin/brand/components/brand-update/BrandEditDialog";
import { useHasPermission } from "@/lib/permissions";

function BrandRow({ item, onDelete, onRefresh }) {
  const canUpdate = useHasPermission("brands.update");
  const canDelete = useHasPermission("brands.delete");
  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors">

      {/* Logo */}
      <TableCell className="px-4 py-3">
        <div className="flex justify-center">
          <img
            src={item.logoUrl ? `${import.meta.env.VITE_API_URL}${item.logoUrl}` : noPhotos}
            alt={item.name || "Sin imagen"}
            className="h-10 w-10 rounded-lg object-cover border border-slate-200 shadow-sm"
          />
        </div>
      </TableCell>

      {/* Marca */}
      <TableCell className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">{item.name}</span>
          <small className="text-slate-400">{item.slug}</small>
        </div>
      </TableCell>

      {/* Descripción */}
      <TableCell className="px-4 py-3 text-slate-600">
        <p className="line-clamp-2 max-w-xs">{item.description || "Sin descripción"}</p>
      </TableCell>

      {/* Estado */}
      <TableCell className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {item.isActive ? "Activo" : "Inactivo"}
        </span>
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <BrandEditDialog item={item} onRefresh={onRefresh} disabled={!canUpdate} />
          <Button
            variant="ghost"
            size="icon"
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none"
            onClick={() => onDelete(item.id)}
            disabled={!canDelete}
            title={!canDelete ? "Sin permiso para eliminar" : undefined}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>

    </TableRow>
  );
}

export default BrandRow;
