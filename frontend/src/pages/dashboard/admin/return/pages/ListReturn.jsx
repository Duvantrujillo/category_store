import { useEffect, useState, useMemo } from "react";
import { ShieldOff } from "lucide-react";
import { useAllReturn, useSearchReturn } from "../hooks/useReturn";
import { useHasPermission } from "@/lib/permissions";

import ReturnTable from "../components/return-list/ReturnTable";
import ReturnCreateDialog from "../components/return-create/ReturnCreateDialog";
import ReturnItemsModal from "../components/return-detail/ReturnItemsModal";
import ReturnUpdateDialog from "../components/return-update/ReturnUpdateDialog";
import RefundModal from "../components/refund/RefundModal";
import ReturnSearch from "../components/return-search/ReturnSearch";

const PAGE_SIZE = 15;

function filterByDate(list, dateFrom, dateTo) {
  if (!dateFrom) return list;
  const from = new Date(dateFrom);
  from.setHours(0, 0, 0, 0);
  const to = new Date(dateTo || dateFrom);
  to.setHours(23, 59, 59, 999);
  return list.filter((r) => {
    const d = new Date(r.createdAt);
    return d >= from && d <= to;
  });
}

const ListReturn = () => {
  const canView   = useHasPermission("returns.view");
  const canCreate = useHasPermission("returns.approve");
  const { returns = [], refetch } = useAllReturn({ skip: !canView });
  const { query, setQuery, results, loading } = useSearchReturn();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [page, setPage]         = useState(1);

  const isTextActive = query.trim().length > 0;
  const isDateActive = !!dateFrom;

  const baseData = useMemo(() => {
    if (isTextActive) return results;
    if (isDateActive) return filterByDate(returns, dateFrom, dateTo);
    return returns;
  }, [isTextActive, isDateActive, results, returns, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(
    (isTextActive || isDateActive) ? baseData.length : returns.length / PAGE_SIZE
  ));

  const dataToShow = (isTextActive || isDateActive)
    ? baseData
    : returns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalItems = (isTextActive || isDateActive) ? 0 : returns.length;

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  useEffect(() => { setPage(1); }, [dateFrom, query]);

  const [selected, setSelected]     = useState(null);
  const [openItems, setOpenItems]   = useState(false);
  const [openEdit, setOpenEdit]     = useState(false);
  const [openRefund, setOpenRefund] = useState(false);

  const handleItems  = (item) => { setSelected(item); setOpenItems(true); };
  const handleEdit   = (item) => { setSelected(item); setOpenEdit(true); };
  const handleRefund = (item) => { setSelected(item); setOpenRefund(true); };
  const handleClose  = (setter) => () => { setter(false); setSelected(null); };

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
        <ReturnSearch
          query={query}
          setQuery={setQuery}
          resultsCount={baseData.length}
          loading={loading}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />
        <ReturnCreateDialog onRefresh={refetch} disabled={!canCreate} />
      </div>

      <ReturnTable
        returns={dataToShow}
        totalItems={totalItems}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onItems={handleItems}
        onEdit={handleEdit}
        onRefund={handleRefund}
      />

      <ReturnItemsModal   open={openItems}  item={selected} onClose={handleClose(setOpenItems)} />
      <ReturnUpdateDialog open={openEdit}   item={selected} onClose={handleClose(setOpenEdit)}   onRefresh={refetch} />
      <RefundModal        open={openRefund} item={selected} onClose={handleClose(setOpenRefund)} onRefresh={refetch} />
    </div>
  );
};

export default ListReturn;
