import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllShipment } from "../hooks/useShipment";
import ShipmentTable from "../components/shipment-list/ShipmentTable";
import ShipmentEditDialog from "../components/shipment-update/ShipmentEditDialog";
import ShipmentHistoryModal from "../components/shipment-history/ShipmentHistoryModal";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

const ShipmentList = () => {
  const canView = useHasPermission("orders.view");
  const { shipments = [], refetch } = useAllShipment({ skip: !canView });
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

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <ShieldOff size={40} className="opacity-40" />
        <p className="text-sm">No tienes permisos para visualizar esta sección.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
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
