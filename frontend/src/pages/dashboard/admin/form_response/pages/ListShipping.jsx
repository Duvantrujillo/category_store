import { useEffect, useMemo, useState } from "react";

import { useShipping } from "../hooks/useShipping";

import ShippingLoading from "../components/shipping-list/ShippingLoading";
import ShippingError from "../components/shipping-list/ShippingError";
import ShippingEmpty from "../components/shipping-list/ShippingEmpty";
import ShippingStats from "../components/shipping-list/ShippingStats";
import ShippingTable from "../components/shipping-list/ShippingTable";
import TablePagination from "@/components/ui/TablePagination";

const PAGE_SIZE = 10;

function ShippingList() {

  const {
    shipping = [],
    loading,
    error,
    loadData,
  } = useShipping();

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(shipping.length / PAGE_SIZE));
  const paginatedShipping = shipping.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const stats = useMemo(() => {

    return {
      total: shipping.length,
    };

  }, [shipping]);

  if (loading) {

    return <ShippingLoading />;

  }

  if (error) {

    return <ShippingError />;

  }

  if (!shipping.length) {

    return <ShippingEmpty />;

  }

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="space-y-1">

          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Envíos
          </h1>

          <p className="text-muted-foreground">
            Administra y consulta la información de los usuarios.
          </p>

        </div>

      </div>

      {/* Stats */}
      <ShippingStats total={stats.total} />

      {/* Table */}
      <ShippingTable
        shipping={paginatedShipping}
        onRefresh={loadData}
      />

      <TablePagination
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={shipping.length}
        onPageChange={setPage}
        className="pt-4"
      />

    </div>
  );
}

export default ShippingList;