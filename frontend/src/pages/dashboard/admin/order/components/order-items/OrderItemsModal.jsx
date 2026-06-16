import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function OrderItemsModal({
  open,
  order,
  onClose,
}) {
  if (!order) return null;

  const totalItems =
    order.items?.reduce(
      (acc, item) =>
        acc + item.quantity,
      0
    ) || 0;

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-6xl">

        <DialogHeader>

          <div className="flex items-center justify-between">

            <div>

              <DialogTitle>
                Productos de la Orden
              </DialogTitle>

              <DialogDescription>
                {order.orderNumber}
              </DialogDescription>

            </div>

            <Badge>
              {totalItems} unidades
            </Badge>

          </div>

        </DialogHeader>

        {order.items?.length > 0 ? (
          <>

            {/* RESUMEN */}

            <div className="grid gap-4 md:grid-cols-3">

              <Card className="shadow-sm">

                <CardContent className="pt-6">

                  <p className="text-sm text-muted-foreground">
                    Productos
                  </p>

                  <p className="text-3xl font-bold">
                    {order.items.length}
                  </p>

                </CardContent>

              </Card>

              <Card className="shadow-sm">

                <CardContent className="pt-6">

                  <p className="text-sm text-muted-foreground">
                    Unidades
                  </p>

                  <p className="text-3xl font-bold">
                    {totalItems}
                  </p>

                </CardContent>

              </Card>

              <Card className="shadow-sm">

                <CardContent className="pt-6">

                  <p className="text-sm text-muted-foreground">
                    Total Orden
                  </p>

                  <p className="text-3xl font-bold">

                    $
                    {Number(
                      order.total
                    ).toLocaleString(
                      "es-CO"
                    )}

                  </p>

                  <p className="text-xs text-muted-foreground">
                    {order.currency}
                  </p>

                </CardContent>

              </Card>

            </div>

            {/* TABLA */}

            <div className="rounded-xl border overflow-hidden">

              <Table>

                <TableHeader>

                  <TableRow>

                    <TableHead>
                      #
                    </TableHead>

                    <TableHead>
                      Producto
                    </TableHead>

                    <TableHead>
                      Cantidad
                    </TableHead>

                    <TableHead>
                      Precio Unitario
                    </TableHead>

                    <TableHead>
                      Subtotal
                    </TableHead>

                  </TableRow>

                </TableHeader>

                <TableBody>

                  {order.items.map(
                    (item, index) => (
                      <TableRow
                        key={item.id}
                      >

                        <TableCell>
                          {index + 1}
                        </TableCell>

                        <TableCell>

                          <div>

                            <p className="font-medium">
                              {
                                item.productName
                              }
                            </p>

                            {item.productVariant && (
                              <p className="text-xs text-muted-foreground">
                              </p>
                            )}

                          </div>

                        </TableCell>

                        <TableCell>

                          <Badge
                            variant="outline"
                          >
                            {
                              item.quantity
                            }
                          </Badge>

                        </TableCell>

                        <TableCell>

                          $
                          {Number(
                            item.unitPrice
                          ).toLocaleString(
                            "es-CO"
                          )}

                        </TableCell>

                        <TableCell className="font-semibold">

                          $
                          {Number(
                            item.subtotal
                          ).toLocaleString(
                            "es-CO"
                          )}

                        </TableCell>

                      </TableRow>
                    )
                  )}

                </TableBody>

              </Table>

            </div>

          </>
        ) : (
          <Card>

            <CardContent className="py-10 text-center text-muted-foreground">

              No hay productos asociados a esta orden.

            </CardContent>

          </Card>
        )}

        <div className="flex justify-end">

          <Button
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>

        </div>

      </DialogContent>
    </Dialog>
  );
}

export default OrderItemsModal;