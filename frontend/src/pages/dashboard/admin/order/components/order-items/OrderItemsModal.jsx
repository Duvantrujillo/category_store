import { Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

function OrderItemsModal({ open, order, onClose }) {
  if (!order) return null;

  const totalItems =
    order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const fmt = (value) =>
    Number(value).toLocaleString("es-CO", { minimumFractionDigits: 0 });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl gap-0 p-0 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Productos de la orden
              </DialogTitle>
              <DialogDescription className="text-xs font-mono text-muted-foreground tracking-wide">
                {order.orderNumber}
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 text-xs font-medium px-2.5 py-1"
            >
              {totalItems} {totalItems === 1 ? "unidad" : "unidades"}
            </Badge>
          </div>
        </div>

        <Separator />

        {order.items?.length > 0 ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 divide-x">
              <div className="px-6 py-4 space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Productos
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {order.items.length}
                </p>
              </div>
              <div className="px-6 py-4 space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Unidades
                </p>
                <p className="text-2xl font-bold tabular-nums">{totalItems}</p>
              </div>
              <div className="px-6 py-4 space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Total orden
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  ${fmt(order.total)}
                </p>
                {order.currency && (
                  <p className="text-[11px] text-muted-foreground">
                    {order.currency}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Tabla */}
            <div className="overflow-auto max-h-[340px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-12 text-center text-[11px] font-semibold uppercase tracking-wider">
                      #
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider">
                      Producto
                    </TableHead>
                    <TableHead className="text-center w-28 text-[11px] font-semibold uppercase tracking-wider">
                      Cantidad
                    </TableHead>
                    <TableHead className="text-right w-36 text-[11px] font-semibold uppercase tracking-wider">
                      P. Unitario
                    </TableHead>
                    <TableHead className="text-right w-36 text-[11px] font-semibold uppercase tracking-wider">
                      Subtotal
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="text-center text-xs text-muted-foreground font-mono">
                        {String(index + 1).padStart(2, "0")}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md border bg-muted/60 flex items-center justify-center shrink-0">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.productName}
                            </p>
                            {item.productVariant?.sku && (
                              <p className="text-[11px] text-muted-foreground font-mono truncate">
                                SKU: {item.productVariant.sku}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center h-6 min-w-8 px-2 rounded-md border bg-background text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                      </TableCell>

                      <TableCell className="text-right text-sm tabular-nums text-muted-foreground font-mono">
                        ${fmt(item.unitPrice)}
                      </TableCell>

                      <TableCell className="text-right text-sm font-semibold tabular-nums font-mono">
                        ${fmt(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

                <TableFooter>
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                      Total
                    </TableCell>
                    <TableCell className="text-right text-sm font-bold tabular-nums font-mono">
                      ${fmt(order.total)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium">Sin productos</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Esta orden no tiene productos asociados.
            </p>
          </div>
        )}

        {/* Footer */}
        <Separator />
        <div className="px-6 py-4 flex justify-end bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

export default OrderItemsModal;
