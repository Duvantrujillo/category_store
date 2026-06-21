import { useEffect } from "react";
import { useShipmentHistory } from "../../hooks/useShipment";
import ShipmentHistoryList from "./ShipmentHistoryList";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ShipmentHistoryModal({ open, shipment, onClose }) {
  const { history, loading, fetchHistory, reset } = useShipmentHistory();

  useEffect(() => {
    if (open && shipment?.id) fetchHistory(shipment.id);
    if (!open) reset();
  }, [open, shipment?.id, fetchHistory, reset]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl">

        {/* Header */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 px-6 py-5">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-white text-lg font-bold tracking-tight leading-none">
                  Historial de envío
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-sm mt-1">
                  {shipment?.order?.orderNumber
                    ? `Pedido ${shipment.order.orderNumber}`
                    : `Envío #${shipment?.id}`}
                </DialogDescription>
              </div>
              {!loading && history.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-500/20 text-slate-300 border-slate-500/30 shrink-0">
                  {history.length} evento{history.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 bg-slate-50 min-h-32">
          <ShipmentHistoryList history={history} loading={loading} />
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cerrar
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
