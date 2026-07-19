import { useEffect, useState } from "react";
import { ShieldOff, Trash2 } from "lucide-react";
import { useAllOrder, useSearchOrder, useFilterOrderByDate } from "../hooks/useOrder";
import OrderTable from "../components/order-list/OrderTable";
import OrderSearch from "../components/order-search/OrderSearch";
import OrderPaymentStatusFilter from "../components/order-filter/OrderPaymentStatusFilter";
import OrderDetailsModal from "../components/order-details/OrderDetailsModal";
import OrderItemsModal from "../components/order-items/OrderItemsModal";
import OrderPaymentModal from "../components/order-payment/OrderPaymentModal";
import ShippingGuideModal from "../components/shipping-guide/ShippingGuideModal";
import BulkShippingGuideButton from "../components/bulk-shipping-guide/BulkShippingGuideButton";
import CancelledOrdersDeleteDialog from "../components/order-delete/CancelledOrdersDeleteDialog";
import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

const OrderList = () => {
  const canView = useHasPermission("orders.view");
  const canDeleteCancelled = useHasPermission("orders.delete");
  const { orders = [], loading, refetch } = useAllOrder({ skip: !canView });
  const { query, setQuery, results: queryResults, loading: queryLoading } = useSearchOrder();
  const { dateFrom, setDateFrom, dateTo, setDateTo, results: dateResults, loading: dateLoading } = useFilterOrderByDate();

  // Filtro de estado de pago (Pagadas/Pendientes) — se combina con la
  // búsqueda por texto y con el rango de fechas, no los reemplaza: se aplica
  // como un paso extra sobre lo que cada uno ya haya resuelto.
  const [statusFilter, setStatusFilter] = useState("all");
  const filterByStatus = (list) => (statusFilter === "all" ? list : list.filter((o) => o.status === statusFilter));

  const [page, setPage] = useState(1);

  const isTextActive = query.trim().length > 0;
  const isDateActive = dateFrom.length > 0;

  const filteredOrders = filterByStatus(orders);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginated = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filteredQueryResults = filterByStatus(queryResults);
  const filteredDateResults = filterByStatus(dateResults);

  const dataToShow = isTextActive ? filteredQueryResults : isDateActive ? filteredDateResults : paginated;
  const totalToShow = isTextActive ? filteredQueryResults.length : isDateActive ? filteredDateResults.length : filteredOrders.length;

  // Solo cuenta como "elegible" lo que el backend realmente va a borrar (ver
  // deleteCancelledOrders en order.controller.js) — el backend decide la
  // regla de verdad, esto es únicamente para mostrar un número certero antes
  // de confirmar. Misma excepción de seguridad: si el pago quedó APPROVED
  // (caso límite del webhook, revisar manualmente) no se cuenta ni se borra.
  const CANCELLED_RETENTION_DAYS = 15;
  const cancelledCutoff = Date.now() - CANCELLED_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const cancelledCount = orders.filter(
    (o) =>
      o.status === "CANCELLED" &&
      new Date(o.createdAt).getTime() < cancelledCutoff &&
      o.payment?.status !== "APPROVED"
  ).length;

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openItems, setOpenItems] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [openShippingGuide, setOpenShippingGuide] = useState(false);
  const [openDeleteCancelled, setOpenDeleteCancelled] = useState(false);

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

  const handleOpenDetails = (order) => { setSelectedOrder(order); setOpenDetails(true); };
  const handleOpenItems = (order) => { setSelectedOrder(order); setOpenItems(true); };
  const handleOpenPayment = (order) => { setSelectedOrder(order); setOpenPayment(true); };
  const handleOpenShippingGuide = (order) => { setSelectedOrder(order); setOpenShippingGuide(true); };

  return (
    <div className="px-6 pt-2 pb-6 space-y-3">

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <OrderSearch
            query={query}
            setQuery={setQuery}
            queryResults={queryResults}
            queryLoading={queryLoading}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            dateResults={dateResults}
            dateLoading={dateLoading}
          />
          <OrderPaymentStatusFilter
            value={statusFilter}
            onChange={(v) => {
              // Junto con setStatusFilter en el mismo evento (no en un
              // useEffect aparte) para que React aplique los dos cambios en
              // un solo render — si no, había un parpadeo de tabla vacía
              // mientras `page` seguía apuntando a una página que el filtro
              // nuevo ya no tiene.
              setStatusFilter(v);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-start gap-2 flex-wrap self-start pt-0.5">
          <BulkShippingGuideButton orders={orders} />
          {canDeleteCancelled && cancelledCount > 0 && (
            <Button
              variant="destructive"
              className="h-8 gap-1.5 shrink-0 rounded-lg px-2.5 text-xs font-semibold whitespace-nowrap"
              onClick={() => setOpenDeleteCancelled(true)}
            >
              <Trash2 size={13} />
              Eliminar canceladas antiguas
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive/20 px-1 text-[10px] font-bold leading-none text-destructive">
                {cancelledCount}
              </span>
            </Button>
          )}
        </div>
      </div>

      <OrderTable
        orders={dataToShow}
        loading={loading}
        totalItems={totalToShow}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onOpenDetails={handleOpenDetails}
        onOpenItems={handleOpenItems}
        onOpenPayment={handleOpenPayment}
        onOpenShippingGuide={handleOpenShippingGuide}
      />

      <OrderDetailsModal open={openDetails} order={selectedOrder} onClose={() => setOpenDetails(false)} />
      <OrderItemsModal open={openItems} order={selectedOrder} onClose={() => setOpenItems(false)} />
      <OrderPaymentModal open={openPayment} order={selectedOrder} onClose={() => setOpenPayment(false)} />
      <ShippingGuideModal open={openShippingGuide} order={selectedOrder} onClose={() => setOpenShippingGuide(false)} />
      <CancelledOrdersDeleteDialog
        open={openDeleteCancelled}
        onClose={() => setOpenDeleteCancelled(false)}
        count={cancelledCount}
        onDeleted={refetch}
      />

    </div>
  );
};

export default OrderList;
