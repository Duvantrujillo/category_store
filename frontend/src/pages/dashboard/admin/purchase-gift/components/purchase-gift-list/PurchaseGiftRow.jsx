import { Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useHasPermission } from "@/lib/permissions";
import PurchaseGiftEditDialog from "../purchase-gift-edit/PurchaseGiftEditDialog";
import { getStatusKey, getGiftVariantLabel } from "../purchase-gift-details/PurchaseGiftDetailsDialog";

const STATUS_CLASS = {
  active:    "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  expired:   "bg-orange-100 text-orange-700",
  paused:    "bg-amber-100 text-amber-700",
  draft:     "bg-slate-100 text-slate-600",
};

const STATUS_LABEL = {
  active: "Activo",
  scheduled: "Programado",
  expired: "Expirado",
  paused: "Pausado",
  draft: "Borrador",
};

function PurchaseGiftRow({ item, onRefresh, onDelete, onViewDetails }) {
  const canUpdate = useHasPermission("purchase-gifts.update");
  const canDelete = useHasPermission("purchase-gifts.delete");
  const statusKey = getStatusKey(item);

  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors">

      {/* Nombre */}
      <TableCell className="text-center px-4 py-3">
        <span className="font-semibold text-slate-800">{item.name}</span>
        {item.description && (
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
        )}
      </TableCell>

      {/* Producto obsequiado */}
      <TableCell className="text-center px-4 py-3 text-slate-600">
        {getGiftVariantLabel(item)} × {item.quantity}
      </TableCell>

      {/* Compra mínima */}
      <TableCell className="text-center px-4 py-3 font-semibold text-slate-800">
        ${Number(item.minimumPurchase).toLocaleString("es-CO")}
      </TableCell>

      {/* Estado */}
      <TableCell className="text-center px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[statusKey]}`}>
          {STATUS_LABEL[statusKey]}
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

          <PurchaseGiftEditDialog item={item} onRefresh={onRefresh} disabled={!canUpdate} />

          <Button
            size="icon"
            variant="secondary"
            className="text-red-500 disabled:opacity-40 disabled:pointer-events-none"
            onClick={() => onDelete(item.id)}
            disabled={!canDelete}
            title={!canDelete ? "Sin permiso para eliminar regalos" : undefined}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>

    </TableRow>
  );
}

export default PurchaseGiftRow;
