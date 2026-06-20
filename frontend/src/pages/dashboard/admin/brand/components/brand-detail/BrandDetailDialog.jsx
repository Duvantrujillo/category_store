import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import noPhotos from "@/assets/icons/no-fotos.png";

export default function BrandDetailDialog({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 text-indigo-500 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de marca</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-1">
            {/* Logo */}
            <div
              className="flex items-center justify-center rounded-xl border border-slate-100 bg-white h-40 overflow-hidden"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
                backgroundSize: "16px 16px",
              }}
            >
              <img
                src={item.logoUrl ? `${import.meta.env.VITE_API_URL}${item.logoUrl}` : noPhotos}
                alt={item.name}
                className="max-h-28 max-w-[70%] object-contain drop-shadow-sm"
              />
            </div>

            {/* Datos */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Nombre</span>
                <span className="text-slate-800 font-semibold">{item.name}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Estado</span>
                <Badge
                  variant="outline"
                  className={`w-fit text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                    item.isActive
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {item.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="col-span-2 flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Slug</span>
                <span className="text-slate-600 font-mono text-xs">/{item.slug}</span>
              </div>

              <div className="col-span-2 flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Descripción</span>
                <span className="text-slate-600 leading-relaxed">{item.description || "Sin descripción"}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
