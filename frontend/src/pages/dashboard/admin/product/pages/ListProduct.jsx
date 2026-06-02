import { useAllProduct } from "@/pages/dashboard/admin/product/hooks/useProduct";

import ProductTable from "../components/product-list/ProductTable";

import ProductCreateDialog from "../components/product-create/ProductCreateDialog";

function ProductList() {
  const {
    products = [],
    refetch,
  } = useAllProduct();

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
        products={products}
        onRefresh={refetch}
      />

    </div>
  );
}

export default ProductList;