import { Fragment, useState } from "react";
import { Package, PackagePlus, ChevronRight } from "lucide-react";

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
  const [expandedBundles, setExpandedBundles] = useState(() => new Set());

  if (!order) return null;

  const items = order.items ?? [];
  const bundleItems = order.bundleItems ?? [];
  const hasContent = items.length > 0 || bundleItems.length > 0;

  const toggleBundle = (id) => {
    setExpandedBundles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalItems =
    items.reduce((acc, item) => acc + item.quantity, 0) +
    bundleItems.reduce((acc, item) => acc + item.quantity, 0);

  const totalLines = items.length + bundleItems.length;

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

        {hasContent ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 divide-x">
              <div className="px-6 py-4 space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Líneas
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {totalLines}
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
                  {bundleItems.map((bundleItem, index) => {
                    const isExpanded = expandedBundles.has(bundleItem.id);
                    const components = bundleItem.items ?? [];

                    return (
                      <Fragment key={`bundle-${bundleItem.id}`}>
                        <TableRow
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleBundle(bundleItem.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleBundle(bundleItem.id);
                            }
                          }}
                          className="hover:bg-indigo-50/60 transition-colors bg-indigo-50/40 cursor-pointer select-none"
                        >
                          <TableCell className="text-center text-xs text-muted-foreground font-mono">
                            {String(index + 1).padStart(2, "0")}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-3">
                              <ChevronRight
                                className={`h-3.5 w-3.5 text-indigo-500 shrink-0 transition-transform ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                              />
                              <div className="h-8 w-8 rounded-md border border-indigo-200 bg-indigo-100 flex items-center justify-center shrink-0">
                                <PackagePlus className="h-3.5 w-3.5 text-indigo-600" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-medium truncate">
                                    {bundleItem.bundleName}
                                  </p>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-200 text-indigo-600 bg-indigo-50">
                                    Combo
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                  {isExpanded ? "Ocultar productos" : `Ver ${components.length} ${components.length === 1 ? "producto" : "productos"}`}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center h-6 min-w-8 px-2 rounded-md border bg-background text-xs font-semibold tabular-nums">
                              {bundleItem.quantity}
                            </span>
                          </TableCell>

                          <TableCell className="text-right text-sm tabular-nums text-muted-foreground font-mono">
                            ${fmt(bundleItem.unitPrice)}
                          </TableCell>

                          <TableCell className="text-right text-sm font-semibold tabular-nums font-mono">
                            ${fmt(bundleItem.subtotal)}
                          </TableCell>
                        </TableRow>

                        {isExpanded &&
                          components.map((detail, detailIndex) => (
                            <TableRow
                              key={`bundle-${bundleItem.id}-detail-${detailIndex}`}
                              className="bg-indigo-50/20 hover:bg-indigo-50/30 transition-colors"
                            >
                              <TableCell className="text-center text-[11px] text-indigo-400/70 font-mono">
                                ↳
                              </TableCell>

                              <TableCell>
                                <div className="flex items-center gap-3 pl-7">
                                  <div className="h-8 w-8 rounded-md border bg-muted/60 flex items-center justify-center shrink-0">
                                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {detail.productName}
                                    </p>
                                    {detail.productVariant?.sku && (
                                      <p className="text-[11px] text-muted-foreground font-mono truncate">
                                        SKU: {detail.productVariant.sku}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell className="text-center">
                                <span className="inline-flex items-center justify-center h-6 min-w-8 px-2 rounded-md border bg-background text-xs font-semibold tabular-nums">
                                  {detail.quantity}
                                </span>
                              </TableCell>

                              <TableCell className="text-right text-sm tabular-nums text-muted-foreground font-mono">
                                —
                              </TableCell>

                              <TableCell className="text-right text-sm tabular-nums text-muted-foreground font-mono">
                                —
                              </TableCell>
                            </TableRow>
                          ))}
                      </Fragment>
                    );
                  })}

                  {items.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="text-center text-xs text-muted-foreground font-mono">
                        {String(bundleItems.length + index + 1).padStart(2, "0")}
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
