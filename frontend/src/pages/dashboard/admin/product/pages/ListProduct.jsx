import { useEffect, useState } from "react";
import { useAllProduct, useSearchProduct } from "@/pages/dashboard/admin/product/hooks/useProduct";
import ProductTable from "@/pages/dashboard/admin/product/Components/product-list/ProductTable";
import ProductCreateDialog from "@/pages/dashboard/admin/product/Components/product-create/ProductCreateDialog";
import ProductSearch from "@/pages/dashboard/admin/product/Components/product-search/ProductSearch";

const PAGE_SIZE = 15;

function ProductList() {
  const { products = [], refetch } = useAllProduct();
  const { query, setQuery, results, loading } = useSearchProduct();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paginated = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const dataToShow = query.trim() ? results : paginated;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Productos</h1>
          <p className="text-muted-foreground">Administra los productos del sistema.</p>
          <ProductSearch query={query} setQuery={setQuery} resultsCount={results.length} loading={loading} />
        </div>
        <ProductCreateDialog onRefresh={refetch} />
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
