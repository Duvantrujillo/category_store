import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryEditDialog from "../category-update/CategoryEditDialog";

import { TableCell, TableRow } from "@/components/ui/table";

function CategoryRow({ item, onDelete, categories, onRefresh }) {

  return (
    <TableRow className="hover:bg-muted/40 transition-colors">

      {/* Nombre */}
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{item.name}</span>
          <small>{item.slug}</small>
        </div>
      </TableCell>

      {/* Descripción */}
      <TableCell>{item.description || "—"}</TableCell>

      {/* Estado */}
      <TableCell>
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${item.isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
            }`}
        >
          {item.isActive ? "Activo" : "Inactivo"}
        </span>
      </TableCell>

      {/* Orden */}
      <TableCell>{item.sortOrder}</TableCell>

      {/* Parent */}
      <TableCell>{item.parent?.name || "Sin padre"}</TableCell>

      {/* Acciones */}
      <TableCell className="text-center space-x-2">

        {/* Botón eliminar */}
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(item.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>

        {/* Editar */}
        <CategoryEditDialog
        
          item={item}
          categories={
            Array.isArray(categories)
              ? categories.filter((c) => c.id !== item.id)
              : []
          }
          
          onRefresh={onRefresh}
        />

      </TableCell>

    </TableRow>
  );
}

export default CategoryRow;