import { useAllBrand } from "../hooks/useBrand";

import BrandTable from "../components/brand-list/BrandTable";

import BrandCreateDialog from "../components/brand-create/BrandCreateDialog";

function BrandList() {

  const {
    brands = [],
    refetch,
  } = useAllBrand();

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
            Gestión de Marcas
          </h1>

          <p className="text-muted-foreground">
            Administra las marcas del sistema.
          </p>

        </div>

        <BrandCreateDialog
          onRefresh={refetch}
        />

      </div>

      <BrandTable
        brands={brands}
        onRefresh={refetch}
      />

    </div>

  );

}

export default BrandList;