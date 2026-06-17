import ReturnItemRow from "./ReturnItemRow";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ReturnItemsModal({ open, item, onClose }) {
  const totalAmount = item?.items?.reduce(
    (sum, ri) => sum + Number(ri.orderItem.unitPrice) * ri.quantity,
    0
  ) ?? 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>

      <DialogContent className="sm:max-w-2xl rounded-2xl">

        <DialogHeader>
          <DialogTitle>Productos a devolver</DialogTitle>
          <DialogDescription>
            {item?.order?.orderNumber
              ? `Pedido ${item.order.orderNumber} — ${item.order.firstName} ${item.order.lastName}`
              : `Solicitud #${item?.id}`}
          </DialogDescription>
        </DialogHeader>

        {item?.reason && (
          <p className="text-sm text-muted-foreground border rounded-xl px-4 py-2">
            <span className="font-medium text-foreground">Motivo: </span>
            {item.reason}
          </p>
        )}

        <div className="rounded-xl border overflow-hidden">

          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-center">Precio unit.</TableHead>
                <TableHead className="text-center">Subtotal</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {item?.items?.map((ri) => (
                <ReturnItemRow key={ri.id} returnItem={ri} />
              ))}
            </TableBody>

          </Table>

        </div>

        <div className="flex justify-end pr-1">
          <span className="text-sm font-semibold">
            Total a reembolsar: ${totalAmount.toLocaleString("es-CO")}
          </span>
        </div>

      </DialogContent>

    </Dialog>
  );
}
