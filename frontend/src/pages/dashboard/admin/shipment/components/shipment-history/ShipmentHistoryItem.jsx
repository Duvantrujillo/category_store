import { UserRound } from "lucide-react";

const statusLabel = {
  CREATED:   "Creado",
  PREPARING: "Preparando",
  SHIPPED:   "Enviado",
  DELIVERED: "Entregado",
  RETURNED:  "Devuelto",
};

const statusStyles = {
  CREATED:   "bg-slate-100 text-slate-700",
  PREPARING: "bg-yellow-100 text-yellow-700",
  SHIPPED:   "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  RETURNED:  "bg-red-100 text-red-700",
};

function ShipmentHistoryItem({ entry }) {
  return (
    <div className="flex items-start gap-3 border rounded-xl p-3">
      <div className="flex flex-col flex-1 gap-1.5">

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[entry.status] ?? "bg-slate-100 text-slate-700"}`}>
            {statusLabel[entry.status] ?? entry.status}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(entry.createdAt).toLocaleString("es-CO")}
          </span>
        </div>

        {entry.updatedBy && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <UserRound size={12} className="shrink-0 text-slate-400" />
            <span className="font-medium text-slate-600">{entry.updatedBy.name}</span>
            <span className="text-slate-400">·</span>
            <span>{entry.updatedBy.email}</span>
          </div>
        )}

        {entry.note && (
          <p className="text-sm text-muted-foreground">{entry.note}</p>
        )}

      </div>
    </div>
  );
}

export default ShipmentHistoryItem;
