import { History } from "lucide-react";
import ShipmentHistoryItem from "./ShipmentHistoryItem";

function ShipmentHistoryList({ history, loading }) {
  if (loading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-5 w-24 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-12 rounded-lg bg-slate-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <History size={32} className="opacity-30 mb-3" />
        <p className="text-sm">Sin historial registrado para este envío.</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto pr-1 py-1">
      {history.map((entry, index) => (
        <ShipmentHistoryItem
          key={entry.id}
          entry={entry}
          isLast={index === history.length - 1}
        />
      ))}
    </div>
  );
}

export default ShipmentHistoryList;
