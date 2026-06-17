import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import ShippingDetailsDialog from "./ShippingDetailsDialog";
import ShippingEditDialog from "../shipping-update/ShippingEditDialog";

function ShippingRow({ item, onDelete }) {
  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors">

      {/* Cliente */}
      <TableCell className="px-4 py-3">
        <span className="font-medium text-slate-800">
          {item.firstName} {item.lastName}
        </span>
      </TableCell>

      {/* Documento */}
      <TableCell className="px-4 py-3 text-slate-600">
        {item.documentNumber}
      </TableCell>

      {/* Teléfono */}
      <TableCell className="px-4 py-3 text-slate-600">
        {item.phoneNumber}
      </TableCell>

      {/* Departamento */}
      <TableCell className="px-4 py-3 text-slate-600">
        {item.departament}
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <ShippingDetailsDialog item={item} />
          <ShippingEditDialog item={item} />
          <Button
            variant="ghost"
            size="icon"
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
            onClick={() => onDelete(item.id || item._id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>

    </TableRow>
  );
}

export default ShippingRow;
