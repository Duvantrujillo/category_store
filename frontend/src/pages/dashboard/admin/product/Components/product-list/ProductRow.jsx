import { Trash } from "lucide-react";

import noPhotos from "@/assets/icons/no-fotos.png";
import { Button } from "@/components/ui/button";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import ProductEditDialog from "@/pages/dashboard/admin/product/components/product-update/ProductEditDialog";

function ProductRow({
  item,
  onDelete,
  onRefresh,
}) {
  return (
    <TableRow className="hover:bg-muted/40 transition-colors">

      {/* Imagen */}
      <TableCell className="flex justify-center">

        <img
          src={item.mainImage
            ? `${import.meta.env.VITE_API_URL}${item.mainImage}`
            : noPhotos
          }
          alt={item.name || "Sin imagen"}
          className="
            h-10
            w-10
            rounded-md
            object-cover
            border
          "
        />

      </TableCell>

      {/* Producto */}
      <TableCell>

        <div className="flex flex-col">

          <span className="font-medium">
            {item.name}
          </span>

          <small className="text-muted-foreground">
            {item.slug}
          </small>

        </div>

      </TableCell>

      {/* Categoría */}
      <TableCell>

        {item.category?.name || "-"}

      </TableCell>

      {/* Marca */}
      <TableCell>

        {item.brand?.name || "-"}

      </TableCell>

      {/* Estado publicación */}
      <TableCell>

        <span
          className={`
            px-2 py-1 rounded-full text-sm font-medium
            ${item.status === "PUBLISHED"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
            }
          `}
        >
          {item.status}
        </span>

      </TableCell>

      {/* Acciones */}
      <TableCell className="text-center space-x-2">

        <ProductEditDialog
          item={item}
          onRefresh={onRefresh}
        />

        <Button
          variant="ghost"
          size="icon"
          className="
            text-destructive
            hover:text-destructive
            hover:bg-destructive/10
          "
          onClick={() =>
            onDelete(item.id)
          }
        >
          <Trash className="h-4 w-4" />
        </Button>

      </TableCell>

    </TableRow>
  );
}

export default ProductRow;