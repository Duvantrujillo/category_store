import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllProduct, useSearchProduct } from "@/pages/dashboard/admin/product/hooks/useProduct";
import ProductTable from "@/pages/dashboard/admin/product/Components/product-list/ProductTable";
import ProductCreateDialog from "@/pages/dashboard/admin/product/Components/product-create/ProductCreateDialog";
import ProductSearch from "@/pages/dashboard/admin/product/Components/product-search/ProductSearch";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function ProductList() {
  const canView   = useHasPermission("products.view");
  const canCreate = useHasPermission("products.create");
  const { products = [], refetch } = useAllProduct({ skip: !canView });
  const { query, setQuery, results, loading } = useSearchProduct();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paginated = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
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
        <ProductSearch query={query} setQuery={setQuery} resultsCount={results.length} loading={loading} />
        <ProductCreateDialog
          onRefresh={refetch}
          disabled={!canCreate}
        />
      </div>

      <ProductTable
        products={dataToShow}
        totalItems={query.trim() ? 0 : products.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onRefresh={refetch}
      />
    </div>
  );
}

export default ProductList;
