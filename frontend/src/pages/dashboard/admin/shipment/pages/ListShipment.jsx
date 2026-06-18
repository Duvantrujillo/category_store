import { useEffect, useState } from "react";
import { useAllShipment } from "../hooks/useShipment";
import ShipmentTable from "../components/shipment-list/ShipmentTable";
import ShipmentEditDialog from "../components/shipment-update/ShipmentEditDialog";
import ShipmentHistoryModal from "../components/shipment-history/ShipmentHistoryModal";

const PAGE_SIZE = 15;

const ShipmentList = () => {
  const { shipments = [], refetch } = useAllShipment();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(shipments.length / PAGE_SIZE));
  const paginated = shipments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [openEdit, setOpenEdit]       = useState(false);
  const [openHistory, setOpenHistory] = useState(false);

  const handleEdit    = (s) => { setSelectedShipment(s); setOpenEdit(true); };
  const handleHistory = (s) => { setSelectedShipment(s); setOpenHistory(true); };
  const handleCloseEdit    = () => { setOpenEdit(false);    setSelectedShipment(null); };
  const handleCloseHistory = () => { setOpenHistory(false); setSelectedShipment(null); };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Envíos</h1>
          <p className="text-muted-foreground">Seguimiento y actualización de envíos.</p>
        </div>
      </div>

      <ShipmentTable
        shipments={paginated}
        totalItems={shipments.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onEdit={handleEdit}
        onHistory={handleHistory}
      />

      <ShipmentEditDialog    open={openEdit}    shipment={selectedShipment} onClose={handleCloseEdit}    onRefresh={refetch} />
      <ShipmentHistoryModal  open={openHistory} shipment={selectedShipment} onClose={handleCloseHistory} />
    </div>
  );
};

export default ShipmentList;
