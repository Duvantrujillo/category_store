import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ------------------------------------------------------------------ */
/*  MODO CREAR – seleccionar items de la orden                          */
/* ------------------------------------------------------------------ */

function CreateItemsSection({ orderItems, selectedItems, handleChange, errors = {} }) {
  const toggle = (orderItemId, availableQty) => {
    const exists = selectedItems.find((i) => i.orderItemId === orderItemId);
    if (exists) {
      handleChange(
        "selectedItems",
        selectedItems.filter((i) => i.orderItemId !== orderItemId)
      );
    } else {
      handleChange("selectedItems", [
        ...selectedItems,
        { orderItemId, quantity: 1, maxQty: availableQty },
      ]);
    }
  };

  const updateQty = (orderItemId, qty, availableQty) => {
    const clamped = Math.max(1, Math.min(Number(qty), availableQty));
    handleChange(
      "selectedItems",
      selectedItems.map((i) =>
        i.orderItemId === orderItemId ? { ...i, quantity: clamped } : i
      )
    );
  };

  if (!orderItems.length) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Selecciona una orden primero para ver sus productos.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Selecciona los productos que el cliente desea devolver y ajusta la cantidad.{" "}
          <span className="text-red-500 font-medium">*</span>
        </p>
      </div>

      {errors.selectedItems && (
        <p className="text-xs text-red-500 -mt-1">{errors.selectedItems}</p>
      )}

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Producto</TableHead>
              <TableHead className="text-center">Disponible</TableHead>
              <TableHead className="text-center w-28">Cantidad</TableHead>
              <TableHead className="text-right">Precio unit.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderItems.map((oi) => {
              const available = oi.availableQty ?? oi.quantity;
              const checked = !!selectedItems.find((i) => i.orderItemId === oi.id);
              const sel = selectedItems.find((i) => i.orderItemId === oi.id);

              return (
                <TableRow key={oi.id}>
                  <TableCell>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(oi.id, available)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{oi.productName}</TableCell>
                  <TableCell className="text-center">{available}</TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min={1}
                      max={available}
                      value={sel?.quantity ?? 1}
                      disabled={!checked}
                      onChange={(e) => updateQty(oi.id, e.target.value, available)}
                      className="w-20 mx-auto text-center"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    ${Number(oi.unitPrice).toLocaleString("es-CO")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedItems.length > 0 && (
        <div className="flex justify-end">
          <span className="text-sm font-semibold">
            Total a devolver: $
            {selectedItems
              .reduce((sum, si) => {
                const oi = orderItems.find((o) => o.id === si.orderItemId);
                return sum + (oi ? Number(oi.unitPrice) * si.quantity : 0);
              }, 0)
              .toLocaleString("es-CO")}
          </span>
        </div>
      )}

    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MODO EDITAR – mostrar items existentes (solo lectura)               */
/* ------------------------------------------------------------------ */

function EditItemsSection({ existingItems }) {
  if (!existingItems?.length) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Esta solicitud no tiene productos registrados.
      </p>
    );
  }

  const total = existingItems.reduce(
    (sum, ri) => sum + Number(ri.orderItem.unitPrice) * ri.quantity,
    0
  );

  return (
    <div className="flex flex-col gap-3">

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-center">Cantidad</TableHead>
              <TableHead className="text-right">Precio unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {existingItems.map((ri) => (
              <TableRow key={ri.id}>
                <TableCell className="font-medium">
                  {ri.orderItem.productName}
                </TableCell>
                <TableCell className="text-center">{ri.quantity}</TableCell>
                <TableCell className="text-right">
                  ${Number(ri.orderItem.unitPrice).toLocaleString("es-CO")}
                </TableCell>
                <TableCell className="text-right">
                  $
                  {(Number(ri.orderItem.unitPrice) * ri.quantity).toLocaleString(
                    "es-CO"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <span className="text-sm font-semibold">
          Total: ${total.toLocaleString("es-CO")}
        </span>
      </div>

    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  EXPORTADO – decide cuál rama mostrar según mode                     */
/* ------------------------------------------------------------------ */

export default function ItemsSection({
  mode,
  form,
  handleChange,
  orderItems = [],
  existingItems = [],
  errors = {},
}) {
  if (mode === "create") {
    return (
      <CreateItemsSection
        orderItems={orderItems}
        selectedItems={form.selectedItems ?? []}
        handleChange={handleChange}
        errors={errors}
      />
    );
  }

  return <EditItemsSection existingItems={existingItems} />;
}
