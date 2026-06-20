import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import AttributeValueEditDialog from "../attribute-value-update/AttributeValueEditDialog";
import { useHasPermission } from "@/lib/permissions";

function AttributeValueRow({ item, onDelete, attributes, onRefresh }) {
  const canUpdate = useHasPermission("attribute-values.update");
  const canDelete = useHasPermission("attribute-values.delete");
  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors">

      {/* Atributo */}
      <TableCell className="text-center px-4 py-3 text-slate-600">
        {item.attribute?.name || "—"}
      </TableCell>

      {/* Valor */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex flex-col items-center">
          <span className="font-medium text-slate-800">{item.value}</span>
          <small className="text-slate-400">{item.slug || "—"}</small>
        </div>
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <AttributeValueEditDialog
            item={item}
            attributes={attributes}
            onRefresh={onRefresh}
            disabled={!canUpdate}
          />
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

export default AttributeValueRow;
