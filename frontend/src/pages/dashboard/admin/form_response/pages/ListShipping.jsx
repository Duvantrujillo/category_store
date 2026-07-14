import { useEffect, useState, useMemo } from "react";
import { ShieldOff } from "lucide-react";
import { useShipping, useSearchShipping } from "../hooks/useShipping";
import ShippingError from "../components/shipping-list/ShippingError";
import ShippingEmpty from "../components/shipping-list/ShippingEmpty";
import ShippingTable from "../components/shipping-list/ShippingTable";
import ShippingSearch from "../components/shipping-search/ShippingSearch";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function filterByDate(list, dateFrom, dateTo) {
  if (!dateFrom) return list;
  const from = new Date(dateFrom);
  from.setHours(0, 0, 0, 0);
  const to = new Date(dateTo || dateFrom);
  to.setHours(23, 59, 59, 999);
  return list.filter((s) => {
    const d = new Date(s.createdAt);
    return d >= from && d <= to;
  });
}

function ShippingList() {
  const canView = useHasPermission("forms.view");
  const { shipping = [], loading, error, loadData } = useShipping({ skip: !canView });
  const { query, setQuery, results, loading: searchLoading } = useSearchShipping();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [page, setPage]         = useState(1);

  const isTextActive = query.trim().length > 0;
  const isDateActive = !!dateFrom;

  const baseData = useMemo(() => {
    if (isTextActive) return results;
    if (isDateActive) return filterByDate(shipping, dateFrom, dateTo);
    return shipping;
  }, [isTextActive, isDateActive, results, shipping, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(
    (isTextActive || isDateActive) ? baseData.length : shipping.length / PAGE_SIZE
  ));

  const dataToShow = (isTextActive || isDateActive)
    ? baseData
    : shipping.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalItems = (isTextActive || isDateActive) ? 0 : shipping.length;

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  useEffect(() => { setPage(1); }, [dateFrom, query]);

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <ShieldOff size={40} className="opacity-40" />
        <p className="text-sm">No tienes permisos para visualizar esta sección.</p>
      </div>
    );
  }

  if (error)   return <ShippingError />;
  if (!loading && !shipping.length && !query.trim() && !isDateActive) return <ShippingEmpty />;

  return (
    <div className="px-6 pt-2 pb-6 space-y-3">
      <ShippingSearch
        query={query}
        setQuery={setQuery}
        resultsCount={baseData.length}
        loading={searchLoading}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
      />

      <ShippingTable
        shipping={dataToShow}
        loading={loading}
        totalItems={totalItems}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onRefresh={loadData}
      />
    </div>
  );
}

export default ShippingList;
