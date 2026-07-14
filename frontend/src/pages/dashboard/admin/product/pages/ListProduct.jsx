import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllProduct, useSearchProduct } from "@/pages/dashboard/admin/product/hooks/useProduct";
import ProductTable from "@/pages/dashboard/admin/product/Components/product-list/ProductTable";
import ProductCreateDialog from "@/pages/dashboard/admin/product/Components/product-create/ProductCreateDialog";
import ProductSearch from "@/pages/dashboard/admin/product/Components/product-search/ProductSearch";
import ProductStatusFilter from "@/pages/dashboard/admin/product/Components/product-filter/ProductStatusFilter";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function ProductList() {
  const canView   = useHasPermission("products.view");
  const canCreate = useHasPermission("products.create");
  const { products = [], loading: listLoading, refetch } = useAllProduct({ skip: !canView });
  const { query, setQuery, results, loading } = useSearchProduct();
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = statusFilter === "all"
    ? products
    : products.filter((p) => p.status === statusFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const searchFiltered = statusFilter === "all"
    ? results
    : results.filter((p) => p.status === statusFilter);

  const dataToShow    = query.trim() ? searchFiltered : paginated;
  const displayTotal  = query.trim() ? 0 : filtered.length;

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  // Resetea la página al cambiar filtro o búsqueda
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
          <ProductSearch query={query} setQuery={setQuery} resultsCount={searchFiltered.length} loading={loading} />
          <ProductStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>
        <ProductCreateDialog onRefresh={refetch} disabled={!canCreate} />
      </div>

      <ProductTable
        products={dataToShow}
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

export default ProductList;
