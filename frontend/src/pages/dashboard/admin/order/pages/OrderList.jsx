import { useEffect, useState } from "react";
import { ShieldOff, Trash2 } from "lucide-react";
import { useAllOrder, useSearchOrder, useFilterOrderByDate } from "../hooks/useOrder";
import OrderTable from "../components/order-list/OrderTable";
import OrderSearch from "../components/order-search/OrderSearch";
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
  const { orders = [], refetch } = useAllOrder({ skip: !canView });
  const { query, setQuery, results: queryResults, loading: queryLoading } = useSearchOrder();
  const { dateFrom, setDateFrom, dateTo, setDateTo, results: dateResults, loading: dateLoading } = useFilterOrderByDate();

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const paginated = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const isTextActive = query.trim().length > 0;
  const isDateActive = dateFrom.length > 0;
  const dataToShow = isTextActive ? queryResults : isDateActive ? dateResults : paginated;
  const totalToShow = isTextActive ? queryResults.length : isDateActive ? dateResults.length : orders.length;

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

  const [selectedOrder, setSelectedOrder]         = useState(null);
  const [openDetails, setOpenDetails]             = useState(false);
  const [openItems, setOpenItems]                 = useState(false);
  const [openPayment, setOpenPayment]             = useState(false);
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

  const handleOpenDetails       = (order) => { setSelectedOrder(order); setOpenDetails(true); };
  const handleOpenItems         = (order) => { setSelectedOrder(order); setOpenItems(true); };
  const handleOpenPayment       = (order) => { setSelectedOrder(order); setOpenPayment(true); };
  const handleOpenShippingGuide = (order) => { setSelectedOrder(order); setOpenShippingGuide(true); };

  return (
    <div className="px-6 pt-2 pb-6 space-y-3">

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
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
        </div>
        <BulkShippingGuideButton orders={orders} />
        {canDeleteCancelled && cancelledCount > 0 && (
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setOpenDeleteCancelled(true)}
          >
            <Trash2 size={15} />
            Eliminar canceladas antiguas
            <span className="bg-destructive/20 text-destructive text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {cancelledCount}
            </span>
          </Button>
        )}
      </div>

      <OrderTable
        orders={dataToShow}
        totalItems={totalToShow}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onOpenDetails={handleOpenDetails}
        onOpenItems={handleOpenItems}
        onOpenPayment={handleOpenPayment}
        onOpenShippingGuide={handleOpenShippingGuide}
      />

      <OrderDetailsModal   open={openDetails}       order={selectedOrder} onClose={() => setOpenDetails(false)} />
      <OrderItemsModal     open={openItems}         order={selectedOrder} onClose={() => setOpenItems(false)} />
      <OrderPaymentModal   open={openPayment}       order={selectedOrder} onClose={() => setOpenPayment(false)} />
      <ShippingGuideModal  open={openShippingGuide} order={selectedOrder} onClose={() => setOpenShippingGuide(false)} />
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
