import { useEffect, useMemo, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useShipping } from "../hooks/useShipping";
import ShippingLoading from "../components/shipping-list/ShippingLoading";
import ShippingError from "../components/shipping-list/ShippingError";
import ShippingEmpty from "../components/shipping-list/ShippingEmpty";
import ShippingStats from "../components/shipping-list/ShippingStats";
import ShippingTable from "../components/shipping-list/ShippingTable";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function ShippingList() {
  const canView = useHasPermission("forms.view");
  const { shipping = [], loading, error, loadData } = useShipping({ skip: !canView });
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(shipping.length / PAGE_SIZE));
  const paginated = shipping.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const stats = useMemo(() => ({ total: shipping.length }), [shipping]);

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <ShieldOff size={40} className="opacity-40" />
        <p className="text-sm">No tienes permisos para visualizar esta sección.</p>
      </div>
    );
  }

  if (loading) return <ShippingLoading />;
  if (error)   return <ShippingError />;
  if (!shipping.length) return <ShippingEmpty />;

  return (
    <div className="p-6 space-y-3">
      <ShippingStats total={stats.total} />

      <ShippingTable
        shipping={paginated}
        totalItems={shipping.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onRefresh={loadData}
      />
    </div>
  );
}

export default ShippingList;
