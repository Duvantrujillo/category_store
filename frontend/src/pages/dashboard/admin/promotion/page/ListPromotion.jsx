import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllPromotion, useSearchPromotion } from "../hooks/usePromotion";
import PromotionTable from "../components/promotion-list/PromotionTable";
import PromotionCreateDialog from "../components/promotion-create/PromotionCreateDialog";
import PromotionDeleteDialog from "../components/promotion-delete/PromotionDeleteDialog";
import PromotionDetailsDialog from "../components/promotion-details/PromotionDetailsDialog";
import { getStatusKey } from "../components/promotion-details/PromotionDetailsDialog";
import PromotionSearch from "../components/promotion-search/PromotionSearch";
import PromotionStatusFilter from "../components/promotion-filter/PromotionStatusFilter";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function applyFilter(list, statusFilter) {
  if (statusFilter === "all") return list;
  return list.filter((item) => getStatusKey(item) === statusFilter);
}

function ListPromotion() {
  const canView = useHasPermission("promotions.view");
  const canCreate = useHasPermission("promotions.create");

  const { promotions = [], loading: listLoading, refetch } = useAllPromotion({ skip: !canView });
  const { query, setQuery, results, loading } = useSearchPromotion();
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);

  const filtered = applyFilter(promotions, statusFilter);
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
          <PromotionSearch query={query} setQuery={setQuery} resultsCount={searchFiltered.length} loading={loading} />
          <PromotionStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>

        <PromotionCreateDialog onRefresh={refetch} disabled={!canCreate} />
      </div>

      <PromotionTable
        promotions={dataToShow}
        loading={listLoading}
        totalItems={displayTotal}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onRefresh={refetch}
        onDelete={handleDelete}
        onViewDetails={setDetailsItem}
      />

      <PromotionDeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteId(null); }}
        promotionId={deleteId}
        onDeleted={refetch}
      />

      <PromotionDetailsDialog
        open={!!detailsItem}
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
      />

    </div>
  );
}

export default ListPromotion;
