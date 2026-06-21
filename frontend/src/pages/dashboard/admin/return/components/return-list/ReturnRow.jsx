import { ClipboardList, Pencil, BadgeDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useHasPermission } from "@/lib/permissions";

const statusConfig = {
  PENDING:   { label: "Pendiente",  cls: "bg-amber-100 text-amber-700"   },
  APPROVED:  { label: "Aprobada",   cls: "bg-blue-100 text-blue-700"     },
  REJECTED:  { label: "Rechazada",  cls: "bg-red-100 text-red-700"       },
  RECEIVED:  { label: "Recibida",   cls: "bg-violet-100 text-violet-700" },
  COMPLETED: { label: "Completada", cls: "bg-green-100 text-green-700"   },
};

const resolutionLabel = {
  REFUND:       "Reembolso",
  EXCHANGE:     "Cambio",
  STORE_CREDIT: "Crédito tienda",
};

const refundConfig = {
  PROCESSED: { label: "Pagado",    cls: "bg-green-100 text-green-700" },
  FAILED:    { label: "Fallido",   cls: "bg-red-100 text-red-700"    },
  PENDING:   { label: "Pendiente", cls: "bg-amber-100 text-amber-700" },
};

function ReturnRow({ item, onDetail, onEdit, onRefund }) {
  const canApprove = useHasPermission("returns.approve");
  const order = item.order;
  const totalAmount = item.items.reduce(
    (sum, ri) => sum + Number(ri.orderItem.unitPrice) * ri.quantity,
    0
  );
  const refund = item.refunds?.[0];
  const { label: statusLabel, cls: statusCls } =
    statusConfig[item.status] ?? { label: item.status, cls: "bg-slate-100 text-slate-700" };

  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors">

      {/* Pedido */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex flex-col items-center">
          <span className="font-semibold text-slate-800">
            {order?.orderNumber ?? `Orden #${item.orderId}`}
          </span>
          {order && (
            <small className="text-slate-400">{order.firstName} {order.lastName}</small>
          )}
        </div>
      </TableCell>

      {/* Estado */}
      <TableCell className="text-center px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCls}`}>
          {statusLabel}
        </span>
      </TableCell>

      {/* Resolución */}
      <TableCell className="text-center px-4 py-3 text-slate-600">
        {item.resolution
          ? resolutionLabel[item.resolution] ?? item.resolution
          : <span className="text-slate-400">—</span>
        }
      </TableCell>

      {/* Monto */}
      <TableCell className="text-center px-4 py-3 font-semibold text-slate-800">
        ${totalAmount.toLocaleString("es-CO")}
      </TableCell>

      {/* Reembolso */}
      <TableCell className="text-center px-4 py-3">
        {refund ? (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            (refundConfig[refund.status] ?? refundConfig.PENDING).cls
          }`}>
            {(refundConfig[refund.status] ?? refundConfig.PENDING).label}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">Sin reembolso</span>
        )}
      </TableCell>

      {/* Fecha */}
      <TableCell className="text-center px-4 py-3 text-slate-500 text-sm">
        {new Date(item.createdAt).toLocaleDateString("es-CO")}
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex justify-center gap-1.5">

          {/* Detalles */}
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => onDetail(item)}
            title="Ver detalles completos"
          >
            <ClipboardList className="h-3.5 w-3.5" />
          </Button>

          {/* Editar */}
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:pointer-events-none"
            onClick={() => onEdit(item)}
            disabled={!canApprove || item.status === "COMPLETED"}
            title={
              !canApprove
                ? "Sin permiso para aprobar devoluciones"
                : item.status === "COMPLETED"
                ? "La solicitud está completada y no puede editarse"
                : undefined
            }
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          {/* Reembolso */}
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 disabled:opacity-40 disabled:pointer-events-none"
            onClick={() => onRefund(item)}
            disabled={!canApprove || item.resolution !== "REFUND"}
            title={
              !canApprove
                ? "Sin permiso para procesar reembolso"
                : item.resolution !== "REFUND"
                ? "Esta solicitud no tiene resolución de reembolso"
                : undefined
            }
          >
            <BadgeDollarSign className="h-3.5 w-3.5" />
          </Button>

        </div>
      </TableCell>

    </TableRow>
  );
}

export default ReturnRow;
