import { Trash } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import CategoryEditDialog from "@/pages/dashboard/admin/category/components/category-update/CategoryEditDialog";

function CategoryCard({ item, onDelete, onRefresh, categories = [] }) {
  return (
    <Card className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">

      {/* Imagen */}
      <div
        className="relative flex items-center justify-center bg-white border-b border-slate-100 h-36 overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
          backgroundSize: "16px 16px",
        }}
      >
        <img
          src={item.imageUrl ? `${import.meta.env.VITE_API_URL}${item.imageUrl}` : noPhotos}
          alt={item.name}
          className="relative z-10 max-h-24 max-w-[75%] w-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <CardContent className="flex flex-col gap-2 px-4 pt-4 pb-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
            <p className="text-[11px] text-slate-400 truncate">/{item.slug}</p>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium border ${
              item.isActive
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-600 border-red-200"
            }`}
          >
            {item.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        {item.parent?.name && (
          <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full w-fit">
            {item.parent.name}
          </span>
        )}

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {item.description || "Sin descripción"}
        </p>
      </CardContent>

      {/* Acciones */}
      <CardFooter className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-1.5">
        <CategoryEditDialog
          item={item}
          categories={categories.filter((c) => c.id !== item.id)}
          onRefresh={onRefresh}
        />
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-rose-500 border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          onClick={() => onDelete(item.id)}
        >
          <Trash className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>

    </Card>
  );
}

export default CategoryCard;
