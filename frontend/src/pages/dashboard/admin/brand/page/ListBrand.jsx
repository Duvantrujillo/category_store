import { useEffect, useState } from "react";
import { useAllBrand, useSearchBrand } from "../hooks/useBrand";
import BrandTable from "../components/brand-list/BrandTable";
import BrandCreateDialog from "../components/brand-create/BrandCreateDialog";
import BrandSearch from "../components/brand-search/BrandSearch";

const PAGE_SIZE = 15;

function BrandList() {
  const { brands = [], refetch } = useAllBrand();
  const { query, setQuery, results, loading } = useSearchBrand();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(brands.length / PAGE_SIZE));
  const paginated = brands.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const dataToShow = query.trim() ? results : paginated;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Marcas</h1>
          <p className="text-muted-foreground">Administra las marcas del sistema.</p>
          <BrandSearch query={query} setQuery={setQuery} resultsCount={results.length} loading={loading} />
        </div>
        <BrandCreateDialog onRefresh={refetch} />
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
