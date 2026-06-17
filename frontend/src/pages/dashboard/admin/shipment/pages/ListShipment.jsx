import { useState } from "react";

import { useAllShipment } from "../hooks/useShipment";
import ShipmentTable from "../components/shipment-list/ShipmentTable";
import ShipmentEditDialog from "../components/shipment-update/ShipmentEditDialog";
import ShipmentHistoryModal from "../components/shipment-history/ShipmentHistoryModal";

const ShipmentList = () => {
  const { shipments, refetch } = useAllShipment();

  const [selectedShipment, setSelectedShipment] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);

  const [openHistory, setOpenHistory] = useState(false);

  const handleEdit = (shipment) => {
    setSelectedShipment(shipment);
    setOpenEdit(true);
  };

  const handleHistory = (shipment) => {
    setSelectedShipment(shipment);
    setOpenHistory(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedShipment(null);
  };

  const handleCloseHistory = () => {
    setOpenHistory(false);
    setSelectedShipment(null);
  };

  return (
    <>
      <ShipmentTable
        shipments={shipments}
        onEdit={handleEdit}
        onHistory={handleHistory}
      />

      <ShipmentEditDialog
        open={openEdit}
        shipment={selectedShipment}
        onClose={handleCloseEdit}
        onRefresh={refetch}
      />

      <ShipmentHistoryModal
        open={openHistory}
        shipment={selectedShipment}
        onClose={handleCloseHistory}
      />
    </>
  );
};

export default ShipmentList;
