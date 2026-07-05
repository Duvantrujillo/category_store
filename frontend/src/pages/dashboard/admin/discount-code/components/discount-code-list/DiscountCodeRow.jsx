import { Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useHasPermission } from "@/lib/permissions";
import DiscountCodeEditDialog from "../discount-code-edit/DiscountCodeEditDialog";
import { formatDiscountValue } from "../discount-code-details/DiscountCodeDetailsDialog";

const TYPE_LABEL = {
  PERCENTAGE: "Porcentaje",
  FIXED: "Monto fijo",
  FREE_SHIPPING: "Envío gratis",
};

function getStatus(item) {
  const now = new Date();
  const start = new Date(item.startsAt);
  const end = new Date(item.expiresAt);
  if (!item.isActive) return { label: "Inactivo", cls: "bg-red-100 text-red-700" };
  if (now < start) return { label: "Programado", cls: "bg-blue-100 text-blue-700" };
  if (now > end) return { label: "Expirado", cls: "bg-orange-100 text-orange-700" };
  return { label: "Activo", cls: "bg-green-100 text-green-700" };
}

function DiscountCodeRow({ item, onRefresh, onDelete, onViewDetails }) {
  const canUpdate = useHasPermission("discount-codes.update");
  const canDelete = useHasPermission("discount-codes.delete");
  const status = getStatus(item);

  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors">

      {/* Código */}
      <TableCell className="text-center px-4 py-3">
        <span className="font-mono font-semibold text-slate-800">{item.code}</span>
        {item.description && (
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
        )}
      </TableCell>

      {/* Tipo */}
      <TableCell className="text-center px-4 py-3 text-slate-600">
        {TYPE_LABEL[item.type] ?? item.type}
      </TableCell>

      {/* Valor */}
      <TableCell className="text-center px-4 py-3 font-semibold text-slate-800">
        {formatDiscountValue(item)}
      </TableCell>

      {/* Estado */}
      <TableCell className="text-center px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>
          {status.label}
        </span>
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex justify-center gap-1.5">
          <Button
            size="icon"
            variant="secondary"
            className="text-slate-500"
            onClick={() => onViewDetails(item)}
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <DiscountCodeEditDialog item={item} onRefresh={onRefresh} disabled={!canUpdate} />

          <Button
            size="icon"
            variant="secondary"
            className="text-red-500 disabled:opacity-40 disabled:pointer-events-none"
            onClick={() => onDelete(item.id)}
            disabled={!canDelete}
            title={!canDelete ? "Sin permiso para eliminar cupones" : undefined}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>

    </TableRow>
  );
}

export default DiscountCodeRow;
