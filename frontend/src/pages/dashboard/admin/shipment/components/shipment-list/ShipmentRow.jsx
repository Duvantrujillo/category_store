import { Pencil, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useHasPermission } from "@/lib/permissions";

const statusConfig = {
  CREATED:   { label: "Creado",      cls: "bg-slate-100 text-slate-700" },
  PREPARING: { label: "Preparando",  cls: "bg-amber-100 text-amber-700" },
  SHIPPED:   { label: "Enviado",     cls: "bg-blue-100 text-blue-700" },
  DELIVERED: { label: "Entregado",   cls: "bg-green-100 text-green-700" },
  RETURNED:  { label: "Devuelto",    cls: "bg-red-100 text-red-700" },
};

const carrierLabel = {
  SERVIENTREGA:    "Servientrega",
  INTERRAPIDISIMO: "Interrapidísimo",
  COORDINADORA:    "Coordinadora",
  ENVIA:           "Envía",
};

function ShipmentRow({ shipment, onEdit, onHistory }) {
  const canUpdate = useHasPermission("shipments.update");
  const order = shipment.order;
  const { label, cls } = statusConfig[shipment.status] ?? { label: shipment.status, cls: "bg-slate-100 text-slate-700" };

  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors">

      {/* Pedido */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex flex-col items-center">
          <span className="font-semibold text-slate-800">
            {order?.orderNumber ?? `#${shipment.orderId}`}
          </span>
          {order && (
            <small className="text-slate-400">{order.firstName} {order.lastName}</small>
          )}
        </div>
      </TableCell>

      {/* Estado */}
      <TableCell className="text-center px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
          {label}
        </span>
      </TableCell>

      {/* Transportista */}
      <TableCell className="text-center px-4 py-3 text-slate-600">
        {shipment.carrier
          ? carrierLabel[shipment.carrier] ?? shipment.carrier
          : <span className="text-slate-400">—</span>
        }
      </TableCell>

      {/* Rastreo */}
      <TableCell className="text-center px-4 py-3">
        {shipment.trackingNumber
          ? <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{shipment.trackingNumber}</span>
          : <span className="text-slate-400">—</span>
        }
      </TableCell>

      {/* Fecha */}
      <TableCell className="text-center px-4 py-3 text-slate-500 text-sm">
        {new Date(shipment.createdAt).toLocaleDateString("es-CO")}
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex justify-center gap-1.5">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 disabled:pointer-events-none"
            onClick={() => onEdit(shipment)}
            disabled={!canUpdate}
            title={!canUpdate ? "Sin permiso para editar envíos" : undefined}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-violet-600 border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            onClick={() => onHistory(shipment)}
          >
            <Clock className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>

    </TableRow>
  );
}

export default ShipmentRow;
