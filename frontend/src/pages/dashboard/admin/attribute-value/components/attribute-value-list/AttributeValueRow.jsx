import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import AttributeValueEditDialog from "../attribute-value-update/AttributeValueEditDialog";

function AttributeValueRow({
  item,
  onDelete,
  attributes,
  onRefresh,
}) {

  return (

    <TableRow className="hover:bg-muted/40 transition-colors">


      {/* Atributo */}
      <TableCell>
        {item.attribute?.name || "—"}
      </TableCell>

      {/* Valor */}
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">
            {item.value}
          </span>
          <small>
            {item.slug || "—"}
          </small>
        </div>
      </TableCell>
      {/* Acciones */}
      <TableCell className="text-center space-x-2">

        <AttributeValueEditDialog
          item={item}
          attributes={attributes}
          onRefresh={onRefresh}
        />

        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(item.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>

      </TableCell>

    </TableRow>

  );

}

export default AttributeValueRow;