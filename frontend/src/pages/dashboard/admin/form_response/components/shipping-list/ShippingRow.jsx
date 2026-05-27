import ShippingDetailsDialog from "./ShippingDetailsDialog";

import ShippingEditDialog from "../shipping-update/ShippingEditDialog";

import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

function ShippingRow({
  item,
  onDelete,
}) {

  return (
    <TableRow
      className="hover:bg-muted/40 transition-colors"
    >

      <TableCell>

        <div className="flex flex-col">

          <span className="font-medium">

            {item.firstName} {item.lastName}

          </span>

        </div>

      </TableCell>

      <TableCell>
        {item.documentNumber}
      </TableCell>

      <TableCell>
        {item.phoneNumber}
      </TableCell>

      <TableCell>
        {item.departament}
      </TableCell>

      <TableCell className="text-center space-x-2">

        <ShippingDetailsDialog
          item={item}
        />

        <ShippingEditDialog
          item={item}
        />

        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() =>
            onDelete(item.id || item._id)
          }
        >

          <Trash className="h-4 w-4" />

        </Button>

      </TableCell>

    </TableRow>
  );
}

export default ShippingRow;