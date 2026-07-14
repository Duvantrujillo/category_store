import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllPurchaseGift, useSearchPurchaseGift } from "../hooks/usePurchaseGift";
import PurchaseGiftTable from "../components/purchase-gift-list/PurchaseGiftTable";
import PurchaseGiftCreateDialog from "../components/purchase-gift-create/PurchaseGiftCreateDialog";
import PurchaseGiftDeleteDialog from "../components/purchase-gift-delete/PurchaseGiftDeleteDialog";
import PurchaseGiftDetailsDialog from "../components/purchase-gift-details/PurchaseGiftDetailsDialog";
import { getStatusKey } from "../components/purchase-gift-details/PurchaseGiftDetailsDialog";
import PurchaseGiftSearch from "../components/purchase-gift-search/PurchaseGiftSearch";
import PurchaseGiftStatusFilter from "../components/purchase-gift-filter/PurchaseGiftStatusFilter";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function applyFilter(list, statusFilter) {
  if (statusFilter === "all") return list;
  return list.filter((item) => getStatusKey(item) === statusFilter);
}

function ListPurchaseGift() {
  const canView = useHasPermission("purchase-gifts.view");
  const canCreate = useHasPermission("purchase-gifts.create");

  const { purchaseGifts = [], loading: listLoading, refetch } = useAllPurchaseGift({ skip: !canView });
  const { query, setQuery, results, loading } = useSearchPurchaseGift();
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);

  const filtered = applyFilter(purchaseGifts, statusFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const searchFiltered = applyFilter(results, statusFilter);
  const dataToShow = query.trim() ? searchFiltered : paginated;
  const displayTotal = query.trim() ? searchFiltered.length : filtered.length;

  useEffect(() => { if (page > totalPages) setPage(1); }, [page, totalPages]);
  useEffect(() => { setPage(1); }, [statusFilter, query]);

  function handleDelete(id) {
    setDeleteId(id);
    setDeleteOpen(true);
  }

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

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <PurchaseGiftSearch query={query} setQuery={setQuery} resultsCount={searchFiltered.length} loading={loading} />
          <PurchaseGiftStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>

        <PurchaseGiftCreateDialog onRefresh={refetch} disabled={!canCreate} />
      </div>

      <PurchaseGiftTable
        purchaseGifts={dataToShow}
        loading={listLoading}
        totalItems={displayTotal}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onRefresh={refetch}
        onDelete={handleDelete}
        onViewDetails={setDetailsItem}
      />

      <PurchaseGiftDeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteId(null); }}
        purchaseGiftId={deleteId}
        onDeleted={refetch}
      />

      <PurchaseGiftDetailsDialog
        open={!!detailsItem}
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
      />

    </div>
  );
}

export default ListPurchaseGift;
