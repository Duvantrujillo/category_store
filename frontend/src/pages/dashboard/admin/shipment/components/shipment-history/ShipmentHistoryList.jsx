import ShipmentHistoryItem from "./ShipmentHistoryItem";

function ShipmentHistoryList({ history, loading }) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Cargando historial...
      </p>
    );
  }

  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Sin historial registrado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
      {history.map((entry) => (
        <ShipmentHistoryItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

export default ShipmentHistoryList;
