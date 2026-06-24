import { Trash2, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import BannerEditDialog from "../banner-edit/BannerEditDialog";

const API = import.meta.env.VITE_API_URL;

function getBannerStatus(banner) {
  const now   = new Date();
  const start = new Date(banner.startDate);
  const end   = new Date(banner.endDate);

  if (!banner.isActive)  return { label: "Inactivo",   cls: "bg-slate-100 text-slate-500",    dot: "bg-slate-400" };
  if (now < start)       return { label: "Programado", cls: "bg-blue-100 text-blue-700",       dot: "bg-blue-400" };
  if (now > end)         return { label: "Expirado",   cls: "bg-orange-100 text-orange-700",   dot: "bg-orange-400" };
  return                        { label: "Activo",     cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" };
}

function fmt(iso) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BannerRow({ banner, onDelete, onRefresh }) {
  const status = getBannerStatus(banner);
  const imgSrc = banner.imageUrl ? `${API}${banner.imageUrl}` : null;

  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors">

      {/* Miniatura */}
      <TableCell className="px-4 py-3">
        <div className="w-20 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
          {imgSrc
            ? <img src={imgSrc} alt={banner.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">Sin img</div>
          }
        </div>
      </TableCell>

      {/* Título */}
      <TableCell className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-slate-800 text-sm leading-tight line-clamp-1">
            {banner.title}
          </span>
          {banner.link && (
            <a
              href={banner.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11px] text-blue-500 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={10} />
              {banner.link.length > 35 ? banner.link.slice(0, 35) + "…" : banner.link}
            </a>
          )}
        </div>
      </TableCell>

      {/* Estado */}
      <TableCell className="px-4 py-3 text-center">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </TableCell>

      {/* Fecha inicio */}
      <TableCell className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5 text-sm text-slate-600">
          <Calendar size={13} className="text-slate-400" />
          {fmt(banner.startDate)}
        </div>
      </TableCell>

      {/* Fecha fin */}
      <TableCell className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5 text-sm text-slate-600">
          <Calendar size={13} className="text-slate-400" />
          {fmt(banner.endDate)}
        </div>
      </TableCell>

      {/* Posición */}
      <TableCell className="px-4 py-3 text-center">
        <span className="text-sm font-semibold text-slate-500">#{banner.position}</span>
      </TableCell>

      {/* Acciones */}
      <TableCell className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <BannerEditDialog item={banner} onRefresh={onRefresh} />

          <Button
            size="icon"
            variant="secondary"
            onClick={() => onDelete(banner.id)}
            className="text-red-500 disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>

    </TableRow>
  );
}
