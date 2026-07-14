import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllProductBundle, useSearchProductBundle } from "../hooks/useProductBundle";
import ProductBundleTable from "../components/product-bundle-list/ProductBundleTable";
import ProductBundleCreateDialog from "../components/product-bundle-create/ProductBundleCreateDialog";
import ProductBundleSearch from "../components/product-bundle-search/ProductBundleSearch";
import ProductBundleStatusFilter from "../components/product-bundle-filter/ProductBundleStatusFilter";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function applyFilter(list, statusFilter) {
  if (statusFilter === "all")      return list;
  if (statusFilter === "active")   return list.filter((i) => i.isActive === true);
  if (statusFilter === "inactive") return list.filter((i) => i.isActive === false);
  return list;
}

function ListProductBundle() {
  const canView   = useHasPermission("bundles.view");
  const canCreate = useHasPermission("bundles.create");
  const { bundles = [], loading: listLoading, refetch } = useAllProductBundle({ skip: !canView });
  const { query, setQuery, results, loading } = useSearchProductBundle();
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered       = applyFilter(bundles, statusFilter);
  const totalPages     = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const searchFiltered = applyFilter(results, statusFilter);
  const dataToShow     = query.trim() ? searchFiltered : paginated;
  const displayTotal   = query.trim() ? 0 : filtered.length;

  useEffect(() => { if (page > totalPages) setPage(1); }, [page, totalPages]);
  useEffect(() => { setPage(1); }, [statusFilter, query]);

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
          <ProductBundleSearch query={query} setQuery={setQuery} resultsCount={searchFiltered.length} loading={loading} />
          <ProductBundleStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>
        <ProductBundleCreateDialog onRefresh={refetch} disabled={!canCreate} />
      </div>

      <ProductBundleTable
        bundles={dataToShow}
        loading={listLoading}
        totalItems={displayTotal}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onRefresh={refetch}
      />
    </div>
  );
}

export default ListProductBundle;
