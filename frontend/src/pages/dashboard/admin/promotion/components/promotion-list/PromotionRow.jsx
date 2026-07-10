import { Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useHasPermission } from "@/lib/permissions";
import PromotionEditDialog from "../promotion-edit/PromotionEditDialog";
import { formatPromotionValue, getStatusKey } from "../promotion-details/PromotionDetailsDialog";

const TYPE_LABEL = {
  PERCENTAGE: "Porcentaje",
  FIXED_AMOUNT: "Monto fijo",
};

const SCOPE_LABEL = {
  ALL_PRODUCTS: "Todo",
  PRODUCTS: "Productos",
  CATEGORIES: "Categorías",
  BRANDS: "Marcas",
};

const STATUS_CLASS = {
  active:    "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  expired:   "bg-orange-100 text-orange-700",
  paused:    "bg-amber-100 text-amber-700",
  draft:     "bg-slate-100 text-slate-600",
};

const STATUS_LABEL = {
  active: "Activa",
  scheduled: "Programada",
  expired: "Expirada",
  paused: "Pausada",
  draft: "Borrador",
};

function PromotionRow({ item, onRefresh, onDelete, onViewDetails }) {
  const canUpdate = useHasPermission("promotions.update");
  const canDelete = useHasPermission("promotions.delete");
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

      {/* Tipo */}
      <TableCell className="text-center px-4 py-3 text-slate-600">
        {TYPE_LABEL[item.type] ?? item.type}
      </TableCell>

      {/* Valor */}
      <TableCell className="text-center px-4 py-3 font-semibold text-slate-800">
        {formatPromotionValue(item)}
      </TableCell>

      {/* Alcance */}
      <TableCell className="text-center px-4 py-3 text-slate-600">
        {SCOPE_LABEL[item.scope] ?? item.scope}
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

          <PromotionEditDialog item={item} onRefresh={onRefresh} disabled={!canUpdate} />

          <Button
            size="icon"
            variant="secondary"
            className="text-red-500 disabled:opacity-40 disabled:pointer-events-none"
            onClick={() => onDelete(item.id)}
            disabled={!canDelete}
            title={!canDelete ? "Sin permiso para eliminar promociones" : undefined}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>

    </TableRow>
  );
}

export default PromotionRow;
