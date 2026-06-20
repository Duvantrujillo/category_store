import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllBrand, useSearchBrand } from "../hooks/useBrand";
import BrandTable from "../components/brand-list/BrandTable";
import BrandCreateDialog from "../components/brand-create/BrandCreateDialog";
import BrandSearch from "../components/brand-search/BrandSearch";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function BrandList() {
  const canView   = useHasPermission("brands.view");
  const canCreate = useHasPermission("brands.create");
  const { brands = [], refetch } = useAllBrand({ skip: !canView });
  const { query, setQuery, results, loading } = useSearchBrand();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(brands.length / PAGE_SIZE));
  const paginated = brands.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const dataToShow = query.trim() ? results : paginated;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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
      <div className="flex items-center justify-between gap-3">
        <BrandSearch query={query} setQuery={setQuery} resultsCount={results.length} loading={loading} />
        <BrandCreateDialog onRefresh={refetch} disabled={!canCreate} />
      </div>

      <BrandTable
        brands={dataToShow}
        totalItems={query.trim() ? 0 : brands.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onRefresh={refetch}
      />
    </div>
  );
}

export default BrandList;
