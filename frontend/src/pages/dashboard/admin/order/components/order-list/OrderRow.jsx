import { Eye, Package, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

const statusConfig = {
  PAID:      { label: "Pagada",      cls: "bg-green-100 text-green-700" },
  PENDING:   { label: "Pendiente",   cls: "bg-amber-100 text-amber-700" },
  CANCELLED: { label: "Cancelada",   cls: "bg-red-100 text-red-700" },
  REFUNDED:  { label: "Reembolsada", cls: "bg-blue-100 text-blue-700" },
};

function OrderRow({ order, onOpenDetails, onOpenItems, onOpenPayment }) {
  const { label, cls } = statusConfig[order.status] ?? { label: order.status, cls: "bg-slate-100 text-slate-700" };

  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors">

      {/* Pedido */}
      <TableCell className="text-center px-4 py-3">
        <span className="font-semibold text-slate-800">{order.orderNumber}</span>
      </TableCell>

      {/* Cliente */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex flex-col items-center">
          <span className="font-medium text-slate-800">{order.firstName} {order.lastName}</span>
          <small className="text-slate-400">{order.email || "Sin correo"}</small>
        </div>
      </TableCell>

      {/* Estado */}
      <TableCell className="text-center px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
          {label}
        </span>
      </TableCell>

      {/* Total */}
      <TableCell className="text-center px-4 py-3 font-semibold text-slate-800">
        ${Number(order.total).toLocaleString("es-CO")}
      </TableCell>

      {/* Fecha */}
      <TableCell className="text-center px-4 py-3 text-slate-500 text-sm">
        {new Date(order.createdAt).toLocaleDateString("es-CO")}
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex justify-center gap-1.5">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => onOpenDetails(order)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-violet-600 border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            onClick={() => onOpenItems(order)}
          >
            <Package className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
            onClick={() => onOpenPayment(order)}
          >
            <CreditCard className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>

    </TableRow>
  );
}

export default OrderRow;
