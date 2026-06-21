import { useEffect, useState, useMemo } from "react";
import { ShieldOff } from "lucide-react";
import { useAllShipment, useSearchShipment } from "../hooks/useShipment";
import ShipmentTable from "../components/shipment-list/ShipmentTable";
import ShipmentEditDialog from "../components/shipment-update/ShipmentEditDialog";
import ShipmentHistoryModal from "../components/shipment-history/ShipmentHistoryModal";
import ShipmentSearch from "../components/shipment-search/ShipmentSearch";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function filterByDate(list, dateFrom, dateTo) {
  if (!dateFrom) return list;
  const from = new Date(dateFrom);
  from.setHours(0, 0, 0, 0);
  const to = new Date(dateTo || dateFrom);
  to.setHours(23, 59, 59, 999);
  return list.filter((s) => {
    const d = new Date(s.createdAt);
    return d >= from && d <= to;
  });
}

const ShipmentList = () => {
  const canView = useHasPermission("orders.view");
  const { shipments = [], refetch } = useAllShipment({ skip: !canView });
  const { query, setQuery, results, loading } = useSearchShipment();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [page, setPage]         = useState(1);

  const isTextActive = query.trim().length > 0;
  const isDateActive = !!dateFrom;

  const baseData = useMemo(() => {
    if (isTextActive) return results;
    if (isDateActive) return filterByDate(shipments, dateFrom, dateTo);
    return shipments;
  }, [isTextActive, isDateActive, results, shipments, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(
    (isTextActive || isDateActive) ? baseData.length : shipments.length / PAGE_SIZE
  ));

  const dataToShow = (isTextActive || isDateActive)
    ? baseData
    : shipments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalItems = (isTextActive || isDateActive) ? 0 : shipments.length;

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  useEffect(() => { setPage(1); }, [dateFrom, query]);

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [openEdit, setOpenEdit]       = useState(false);
  const [openHistory, setOpenHistory] = useState(false);

  const handleEdit         = (s) => { setSelectedShipment(s); setOpenEdit(true); };
  const handleHistory      = (s) => { setSelectedShipment(s); setOpenHistory(true); };
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
    <div className="px-6 pt-2 pb-6 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <ShipmentSearch
          query={query}
          setQuery={setQuery}
          resultsCount={baseData.length}
          loading={loading}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />
      </div>

      <ShipmentTable
        shipments={dataToShow}
        totalItems={totalItems}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onEdit={handleEdit}
        onHistory={handleHistory}
      />

      <ShipmentEditDialog   open={openEdit}    shipment={selectedShipment} onClose={handleCloseEdit}    onRefresh={refetch} />
      <ShipmentHistoryModal open={openHistory} shipment={selectedShipment} onClose={handleCloseHistory} />
    </div>
  );
};

export default ShipmentList;
