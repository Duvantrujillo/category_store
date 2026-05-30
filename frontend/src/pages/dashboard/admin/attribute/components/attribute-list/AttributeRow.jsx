import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import AttributeEditDialog from "@/pages/dashboard/admin/attribute/components/atribute-update/AttributeEditDialog";

function AttributeRow({ item, onDelete, onRefresh }) {

  return (

    <TableRow className="hover:bg-muted/40 transition-colors">

      {/* Nombre */}
      <TableCell>
        <div className="flex flex-col">

          <span className="font-medium">
            {item.name}
          </span>

          <small className="text-muted-foreground">
            {item.slug}
          </small>

        </div>
      </TableCell>

      {/* Tipo */}
      <TableCell>
        {item.type || "—"}
      </TableCell>

      {/* Estado */}
      <TableCell>

        <span
          className={`
            px-2 py-1 rounded-full text-sm font-medium
            ${item.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
            }
          `}
        >
          {item.isActive ? "Activo" : "Inactivo"}
        </span>

      </TableCell>

      {/* Acciones */}
      <TableCell className="text-center space-x-2">

        {/* Editar */}
        <AttributeEditDialog
          item={item}
          onRefresh={onRefresh}
        />

        {/* Eliminar */}
        <Button
          variant="ghost"
          size="icon"
          className="
            text-destructive
            hover:text-destructive
            hover:bg-destructive/10
          "
          onClick={() => onDelete(item.id)}
        >

          <Trash className="h-4 w-4" />

        </Button>

      </TableCell>

    </TableRow>

  );
}

export default AttributeRow;