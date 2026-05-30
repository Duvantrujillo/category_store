import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import BrandEditDialog from "@/pages/dashboard/admin/brand/components/brand-update/BrandEditDialog";

function BrandRow({
  item,
  onDelete,
  onRefresh,
}) {

  return (

    <TableRow className="hover:bg-muted/40 transition-colors">

  {/* Logo */}
  <TableCell>

    {item.logoUrl && (

      <img
        src={`${import.meta.env.VITE_API_URL}${item.logoUrl}`}
        alt={item.name}
        className="
          h-10
          w-10
          rounded-md
          object-cover
          border
        "
      />

    )}

  </TableCell>

  {/* Marca */}
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

  {/* Descripción */}
  <TableCell>

    <p className="line-clamp-2 max-w-xs">

      {item.description || "Sin descripción"}

    </p>

  </TableCell>

  {/* Estado */}
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

  {/* Acciones */}
  <TableCell className="text-center space-x-2">

    <BrandEditDialog
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
      onClick={() => onDelete(item.id)}
    >
      <Trash className="h-4 w-4" />
    </Button>

  </TableCell>

</TableRow>

  );

}

export default BrandRow;