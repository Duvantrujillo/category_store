import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryEditDialog from "../category-update/CategoryEditDialog";
import { TableCell, TableRow } from "@/components/ui/table";

function CategoryRow({ item, onDelete, categories, onRefresh }) {
  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors">

      {/* Nombre */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex flex-col items-center">
          <span className="font-medium text-slate-800">{item.name}</span>
          <small className="text-slate-400">{item.slug}</small>
        </div>
      </TableCell>

      {/* Descripción */}
      <TableCell className="text-center px-4 py-3 text-slate-600 max-w-xs">
        <p className="line-clamp-2">{item.description || "—"}</p>
      </TableCell>

      {/* Estado */}
      <TableCell className="text-center px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {item.isActive ? "Activo" : "Inactivo"}
        </span>
      </TableCell>

      {/* Orden */}
      <TableCell className="text-center px-4 py-3 text-slate-600">{item.sortOrder}</TableCell>

      {/* Padre */}
      <TableCell className="text-center px-4 py-3">
        {item.parent?.name
          ? <span className="text-slate-700">{item.parent.name}</span>
          : <span className="text-slate-400 text-xs">Sin padre</span>
        }
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-center px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <CategoryEditDialog
            item={item}
            categories={Array.isArray(categories) ? categories.filter((c) => c.id !== item.id) : []}
            onRefresh={onRefresh}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
            onClick={() => onDelete(item.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>

    </TableRow>
  );
}

export default CategoryRow;
