import { TableCell, TableRow } from "@/components/ui/table";

function ReturnItemRow({ returnItem }) {
  const { orderItem, quantity } = returnItem;

  const subtotal = Number(orderItem.unitPrice) * quantity;

  return (
    <TableRow>

      <TableCell className="align-middle">
        {orderItem.productName}
      </TableCell>

      <TableCell className="text-center align-middle">
        {quantity}
      </TableCell>

      <TableCell className="text-center align-middle">
        ${Number(orderItem.unitPrice).toLocaleString("es-CO")}
      </TableCell>

      <TableCell className="text-center align-middle font-semibold">
        ${subtotal.toLocaleString("es-CO")}
      </TableCell>

    </TableRow>
  );
}

export default ReturnItemRow;
