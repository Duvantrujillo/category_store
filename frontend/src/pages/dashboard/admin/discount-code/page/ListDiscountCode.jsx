import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllDiscountCode, useSearchDiscountCode } from "../hooks/useDiscountCode";
import DiscountCodeTable from "../components/discount-code-list/DiscountCodeTable";
import DiscountCodeCreateDialog from "../components/discount-code-create/DiscountCodeCreateDialog";
import DiscountCodeDeleteDialog from "../components/discount-code-delete/DiscountCodeDeleteDialog";
import DiscountCodeDetailsDialog from "../components/discount-code-details/DiscountCodeDetailsDialog";
import DiscountCodeSearch from "../components/discount-code-search/DiscountCodeSearch";
import DiscountCodeStatusFilter from "../components/discount-code-filter/DiscountCodeStatusFilter";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function getStatusKey(item) {
  const now = new Date();
  const start = new Date(item.startsAt);
  const end = new Date(item.expiresAt);
  if (!item.isActive) return "inactive";
  if (now < start) return "scheduled";
  if (now > end) return "expired";
  return "active";
}

function applyFilter(list, statusFilter) {
  if (statusFilter === "all") return list;
  return list.filter((item) => getStatusKey(item) === statusFilter);
}

function ListDiscountCode() {
  const canView = useHasPermission("discount-codes.view");
  const canCreate = useHasPermission("discount-codes.create");

  const { discountCodes = [], refetch } = useAllDiscountCode({ skip: !canView });
  const { query, setQuery, results, loading } = useSearchDiscountCode();
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);

  const filtered = applyFilter(discountCodes, statusFilter);
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

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <DiscountCodeSearch query={query} setQuery={setQuery} resultsCount={searchFiltered.length} loading={loading} />
          <DiscountCodeStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>

        <DiscountCodeCreateDialog onRefresh={refetch} disabled={!canCreate} />
      </div>

      <DiscountCodeTable
        discountCodes={dataToShow}
        totalItems={displayTotal}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onRefresh={refetch}
        onDelete={handleDelete}
        onViewDetails={setDetailsItem}
      />

      <DiscountCodeDeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteId(null); }}
        discountCodeId={deleteId}
        onDeleted={refetch}
      />

      <DiscountCodeDetailsDialog
        open={!!detailsItem}
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
      />

    </div>
  );
}

export default ListDiscountCode;
