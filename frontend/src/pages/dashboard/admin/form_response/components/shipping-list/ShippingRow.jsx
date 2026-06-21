import { useState } from "react";
import { Trash, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import ShippingDetailsDialog from "./ShippingDetailsDialog";
import ShippingGuideDialog from "./ShippingGuideDialog";
import ShippingEditDialog from "../shipping-update/ShippingEditDialog";
import { useHasPermission } from "@/lib/permissions";

function ShippingRow({ item, onDelete, onRefresh }) {
  const canUpdate = useHasPermission("forms.update");
  const canDelete = useHasPermission("forms.delete");
  const [guideOpen, setGuideOpen] = useState(false);
  return (
    <>
    <TableRow className="hover:bg-slate-50/80 transition-colors">

      {/* Cliente */}
      <TableCell className="px-4 py-3 text-center">
        <span className="font-medium text-slate-800">
          {item.firstName} {item.lastName}
        </span>
      </TableCell>

      {/* Documento */}
      <TableCell className="px-4 py-3 text-center text-slate-600">
        {item.documentNumber}
      </TableCell>

      {/* Teléfono */}
      <TableCell className="px-4 py-3 text-center text-slate-600">
        {item.phoneNumber}
      </TableCell>

      {/* Departamento */}
      <TableCell className="px-4 py-3 text-center text-slate-600">
        {item.departament}
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <ShippingDetailsDialog item={item} />
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            onClick={() => setGuideOpen(true)}
            title="Ver guía de envío"
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>
          <ShippingEditDialog item={item} onRefresh={onRefresh} disabled={!canUpdate} />
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40 disabled:pointer-events-none"
            onClick={() => onDelete(item.id || item._id)}
            disabled={!canDelete}
            title={!canDelete ? "Sin permiso para eliminar formularios" : undefined}
          >
            <Trash className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>

    </TableRow>

    <ShippingGuideDialog
      open={guideOpen}
      item={item}
      onClose={() => setGuideOpen(false)}
    />
    </>
  );
}

export default ShippingRow;
