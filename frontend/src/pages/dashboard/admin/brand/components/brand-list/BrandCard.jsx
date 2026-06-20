import { Trash } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import BrandEditDialog from "@/pages/dashboard/admin/brand/components/brand-update/BrandEditDialog";
import BrandDetailDialog from "@/pages/dashboard/admin/brand/components/brand-detail/BrandDetailDialog";
import { useHasPermission } from "@/lib/permissions";

function BrandCard({ item, onDelete, onRefresh }) {
  const canUpdate = useHasPermission("brands.update");
  const canDelete = useHasPermission("brands.delete");
  return (
    <Card className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">

      {/* Logo */}
      <div className="relative flex items-center justify-center bg-white border-b border-slate-100 h-36 overflow-hidden">
        <div className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        />
        <img
          src={item.logoUrl ? `${import.meta.env.VITE_API_URL}${item.logoUrl}` : noPhotos}
          alt={item.name || "Sin imagen"}
          className="relative z-10 max-h-24 max-w-[75%] w-auto object-contain drop-shadow-sm"
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

      </CardContent>

      {/* Acciones */}
      <CardFooter className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-1.5">
        <BrandDetailDialog item={item} />
        <BrandEditDialog item={item} onRefresh={onRefresh} disabled={!canUpdate} />
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-rose-500 border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 disabled:pointer-events-none"
          onClick={() => onDelete(item.id)}
          disabled={!canDelete}
          title={!canDelete ? "Sin permiso para eliminar" : undefined}
        >
          <Trash className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>

    </Card>
  );
}

export default BrandCard;
