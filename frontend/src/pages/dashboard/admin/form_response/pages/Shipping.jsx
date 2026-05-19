import { useMemo } from "react";

import { useShipping } from "../hooks/useShipping";

import ShippingLoading from "../components/shipping-list/ShippingLoading";
import ShippingError from "../components/shipping-list/ShippingError";
import ShippingEmpty from "../components/shipping-list/ShippingEmpty";
import ShippingStats from "../components/shipping-list/ShippingStats";
import ShippingTable from "../components/shipping-list/ShippingTable";

function ShippingList() {
  const {
    shipping = [],
    loading,
    error,
  } = useShipping();

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
      <ShippingTable shipping={shipping} />

    </div>
  );
}

export default ShippingList;