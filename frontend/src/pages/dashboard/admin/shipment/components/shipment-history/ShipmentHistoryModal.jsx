import { useEffect } from "react";

import { useShipmentHistory } from "../../hooks/useShipment";
import ShipmentHistoryList from "./ShipmentHistoryList";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ShipmentHistoryModal({ open, shipment, onClose }) {
  const { history, loading, fetchHistory, reset } = useShipmentHistory();

  useEffect(() => {
    if (open && shipment?.id) {
      fetchHistory(shipment.id);
    }
    if (!open) {
      reset();
    }
  }, [open, shipment?.id, fetchHistory, reset]);

  return (
    <Dialog open={open} onOpenChange={onClose}>

      <DialogContent className="sm:max-w-lg rounded-2xl">

        <DialogHeader>

          <DialogTitle>Historial de envío</DialogTitle>

          <DialogDescription>
            {shipment?.order?.orderNumber
              ? `Pedido ${shipment.order.orderNumber}`
              : `Envío #${shipment?.id}`}
          </DialogDescription>

        </DialogHeader>

        <ShipmentHistoryList history={history} loading={loading} />

      </DialogContent>

    </Dialog>
  );
}
