import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import AttributeEditDialog from "@/pages/dashboard/admin/attribute/components/atribute-update/AttributeEditDialog";
import { useHasPermission } from "@/lib/permissions";

function AttributeRow({ item, onDelete, onRefresh }) {
  const canUpdate = useHasPermission("attributes.update");
  const canDelete = useHasPermission("attributes.delete");
  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors">

      {/* Nombre */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex flex-col items-center">
          <span className="font-medium text-slate-800">{item.name}</span>
          <small className="text-slate-400">{item.slug}</small>
        </div>
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
          <AttributeEditDialog item={item} onRefresh={onRefresh} disabled={!canUpdate} />
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

export default AttributeRow;
