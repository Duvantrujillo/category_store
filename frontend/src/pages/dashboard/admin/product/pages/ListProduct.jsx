import { useEffect, useState } from "react";

import { useAllProduct } from "@/pages/dashboard/admin/product/hooks/useProduct";

import ProductTable from "../components/product-list/ProductTable";
import TablePagination from "@/components/ui/TablePagination";

import ProductCreateDialog from "../components/product-create/ProductCreateDialog";

const PAGE_SIZE = 10;

function ProductList() {
  const {
    products = [],
    refetch,
  } = useAllProduct();

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paginatedProducts = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6 p-6">

      <div
        className="
          flex flex-col gap-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >
        <div className="space-y-1">

          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Productos
          </h1>

          <p className="text-muted-foreground">
            Administra los productos del sistema.
          </p>

        </div>

        <ProductCreateDialog
          onRefresh={refetch}
        />

      </div>

      <ProductTable
        products={paginatedProducts}
        onRefresh={refetch}
      />

      <TablePagination
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={products.length}
        onPageChange={setPage}
        className="pt-4"
      />

    </div>
  );
}

export default ProductList;