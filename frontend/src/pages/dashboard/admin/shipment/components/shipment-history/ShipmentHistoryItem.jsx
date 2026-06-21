import { UserRound, Package, Wrench, Truck, CheckCircle2, RotateCcw, Circle } from "lucide-react";

const STATUS_CONFIG = {
  CREATED:   { label: "Creado",     Icon: Package,      dot: "bg-slate-400",   line: "bg-slate-200",  badge: "bg-slate-100  text-slate-700  border-slate-200"  },
  PREPARING: { label: "Preparando", Icon: Wrench,       dot: "bg-amber-400",   line: "bg-amber-200",  badge: "bg-amber-50   text-amber-700  border-amber-200"  },
  SHIPPED:   { label: "Enviado",    Icon: Truck,        dot: "bg-blue-400",    line: "bg-blue-200",   badge: "bg-blue-50    text-blue-700   border-blue-200"   },
  DELIVERED: { label: "Entregado",  Icon: CheckCircle2, dot: "bg-green-400",   line: "bg-green-200",  badge: "bg-green-50   text-green-700  border-green-200"  },
  RETURNED:  { label: "Devuelto",   Icon: RotateCcw,    dot: "bg-rose-400",    line: "bg-rose-200",   badge: "bg-rose-50    text-rose-700   border-rose-200"   },
};

function ShipmentHistoryItem({ entry, isLast }) {
  const cfg = STATUS_CONFIG[entry.status] ?? {
    label: entry.status, Icon: Circle,
    dot: "bg-slate-400", line: "bg-slate-200",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  };
  const { Icon } = cfg;

  return (
    <div className="flex gap-4">

      {/* Eje del timeline */}
      <div className="flex flex-col items-center shrink-0 w-8">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-sm shrink-0 ${cfg.dot}`}>
          <Icon size={14} className="text-white" />
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-1 min-h-4 ${cfg.line}`} />
        )}
      </div>

      {/* Contenido */}
      <div className={`flex-1 pb-5 ${isLast ? "" : ""}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge}`}>
            <Icon size={10} />
            {cfg.label}
          </span>
          <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
            {new Date(entry.createdAt).toLocaleString("es-CO")}
          </span>
        </div>

        {(entry.updatedBy || entry.note) && (
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 mt-1.5 space-y-1.5">
            {entry.updatedBy && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <UserRound size={11} className="text-slate-400 shrink-0" />
                <span className="font-medium text-slate-700">{entry.updatedBy.name}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-400">{entry.updatedBy.email}</span>
              </div>
            )}
            {entry.note && (
              <p className="text-xs text-slate-600 leading-snug">{entry.note}</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default ShipmentHistoryItem;
