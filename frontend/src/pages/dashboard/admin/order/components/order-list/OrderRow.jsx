import { Eye } from "lucide-react";
import { Package } from "lucide-react";
import { CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

const getStatusStyles = (status) => {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "REFUNDED":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "PAID":
      return "Pagada";

    case "PENDING":
      return "Pendiente";

    case "CANCELLED":
      return "Cancelada";

    case "REFUNDED":
      return "Reembolsada";

    default:
      return status;
  }
};

function OrderRow({
  order,
  onOpenDetails,
  onOpenItems,
  onOpenPayment,
}) {
  return (
    <TableRow className="hover:bg-muted/40 transition-colors">

      {/* PEDIDO */}
      <TableCell>

        <div className="flex flex-col">

          <span className="font-semibold">
            {order.orderNumber}
          </span>

        </div>

      </TableCell>

      {/* CLIENTE */}
      <TableCell>

        <div className="flex flex-col">

          <span className="font-medium">
            {order.firstName} {order.lastName}
          </span>

          <small className="text-muted-foreground">
            {order.email || "Sin correo"}
          </small>

        </div>

      </TableCell>

      {/* ESTADO */}
      <TableCell>

        <span
          className={`
            px-2 py-1 rounded-full text-sm font-medium
            ${getStatusStyles(order.status)}
          `}
        >
          {getStatusLabel(order.status)}
        </span>

      </TableCell>

      {/* TOTAL */}
      <TableCell>

        <span className="font-semibold">

          $
          {Number(order.total).toLocaleString(
            "es-CO"
          )}

        </span>

      </TableCell>

      {/* FECHA */}
      <TableCell>

        {new Date(
          order.createdAt
        ).toLocaleDateString("es-CO")}

      </TableCell>

      {/* ACCIONES */}
      <TableCell>

  <div className="flex justify-center gap-2">

    <Button
      size="icon"
      variant="outline"
      className="
        text-blue-600
        border-blue-200
        hover:bg-blue-50
        hover:text-blue-700
      "
      onClick={() =>
        onOpenDetails(order)
      }
    >
      <Eye className="h-4 w-4" />
    </Button>

    <Button
      size="icon"
      variant="outline"
      className="
        text-violet-600
        border-violet-200
        hover:bg-violet-50
        hover:text-violet-700
      "
      onClick={() =>
        onOpenItems(order)
      }
    >
      <Package className="h-4 w-4" />
    </Button>

    <Button
      size="icon"
      variant="outline"
      className="
        text-green-600
        border-green-200
        hover:bg-green-50
        hover:text-green-700
      "
      onClick={() =>
        onOpenPayment(order)
      }
    >
      <CreditCard className="h-4 w-4" />
    </Button>

  </div>

</TableCell>

    </TableRow>
  );
}

export default OrderRow;