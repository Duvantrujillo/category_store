import { Trash } from "lucide-react";

import noPhotos from "@/assets/icons/no-fotos.png";
import { Button } from "@/components/ui/button";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import ProductVariantEditDialog from "@/pages/dashboard/admin/product-variant/components/product-variant-update/ProductVariantEditDialog";

function ProductVariantRow({
  item,
  onDelete,
  onRefresh,
  products = [],
  attributes = [],
}) {

  return (

    <TableRow className="hover:bg-muted/40 transition-colors">

      {/* IMAGEN */}
      <TableCell className="flex justify-center">

        <img
          src={item.images?.[0]?.imageUrl
            ? `${import.meta.env.VITE_API_URL}${item.images[0].imageUrl}`
            : noPhotos
          }
          alt={item.sku || "Sin imagen"}
          className="
            h-10
            w-10
            rounded-md
            object-cover
            border
          "
        />

      </TableCell>

      {/* SKU */}
      <TableCell>

        <div className="flex flex-col">

          <span className="font-medium">
            {item.sku}
          </span>

          <small className="text-muted-foreground">
            {item.barcode || "Sin código"}
          </small>

        </div>

      </TableCell>

      {/* PRECIO */}
      <TableCell>

        ${Number(item.price).toLocaleString()}

      </TableCell>

      {/* STOCK */}
      <TableCell>

        {item.stock}

      </TableCell>

      {/* PRINCIPAL */}
      <TableCell>

        <span
          className={`
            px-2 py-1 rounded-full text-sm font-medium
            ${item.isDefault
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-700"
            }
          `}
        >

          {item.isDefault
            ? "Principal"
            : "Secundaria"}

        </span>

      </TableCell>

      {/* ESTADO */}
      <TableCell>

        <span
          className={`
            px-2 py-1 rounded-full text-sm font-medium
            ${item.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
            }
          `}
        >

          {item.isActive
            ? "Activo"
            : "Inactivo"}

        </span>

      </TableCell>

      {/* ACCIONES */}
      <TableCell className="text-center space-x-2">

        <ProductVariantEditDialog
          item={item}
          onRefresh={onRefresh}
          products={products}
          attributes={attributes}
        />

        <Button
          variant="ghost"
          size="icon"
          className="
            text-destructive
            hover:text-destructive
            hover:bg-destructive/10
          "
          onClick={() => onDelete(item.id)}
        >

          <Trash className="h-4 w-4" />

        </Button>

      </TableCell>

    </TableRow>

  );

}

export default ProductVariantRow;