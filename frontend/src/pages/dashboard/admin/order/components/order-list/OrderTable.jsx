import OrderRow from "./OrderRow";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

function OrderTable({
  orders,
  onOpenDetails,
  onOpenItems,
  onOpenPayment,
}) {
  return (
    <Card className="rounded-2xl shadow-sm border">

      <CardHeader className="pb-3">

        <CardTitle>
          Órdenes Registradas
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          Total de órdenes: {orders.length}
        </p>

      </CardHeader>

      <CardContent>

        <div className="rounded-xl border overflow-hidden">

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead className="text-center">
                  Pedido
                </TableHead>

                <TableHead className="text-center">
                  Cliente
                </TableHead>

                <TableHead className="text-center">
                  Estado
                </TableHead>

                <TableHead className="text-center">
                  Total
                </TableHead>

                <TableHead className="text-center">
                  Fecha
                </TableHead>

                <TableHead className="text-center">
                  Acciones
                </TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {orders?.length > 0 ? (
                orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onOpenDetails={onOpenDetails}
                    onOpenItems={onOpenItems}
                    onOpenPayment={onOpenPayment}
                  />
                ))
              ) : (
                <TableRow>

                  <TableCell
                    colSpan={6}
                    className="
                      h-24
                      text-center
                      text-muted-foreground
                    "
                  >
                    No hay órdenes registradas.
                  </TableCell>

                </TableRow>
              )}

            </TableBody>

          </Table>

        </div>

      </CardContent>

    </Card>
  );
}

export default OrderTable;