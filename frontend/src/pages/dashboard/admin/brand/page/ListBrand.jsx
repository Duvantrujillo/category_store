import { useEffect, useState } from "react";

import { useAllBrand } from "../hooks/useBrand";

import BrandTable from "../components/brand-list/BrandTable";
import TablePagination from "@/components/ui/TablePagination";

import BrandCreateDialog from "../components/brand-create/BrandCreateDialog";

const PAGE_SIZE = 10;

function BrandList() {

  const {
    brands = [],
    refetch,
  } = useAllBrand();

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(brands.length / PAGE_SIZE));
  const paginatedBrands = brands.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        brands={paginatedBrands}
        onRefresh={refetch}
      />

      <TablePagination
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={brands.length}
        onPageChange={setPage}
        className="pt-4"
      />

    </div>

  );

}

export default BrandList;