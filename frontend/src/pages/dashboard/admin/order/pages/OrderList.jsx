import { useEffect, useState } from "react";
import { useAllOrder, useSearchOrder, useFilterOrderByDate } from "../hooks/useOrder";
import OrderTable from "../components/order-list/OrderTable";
import OrderSearch from "../components/order-search/OrderSearch";
import OrderDetailsModal from "../components/order-details/OrderDetailsModal";
import OrderItemsModal from "../components/order-items/OrderItemsModal";
import OrderPaymentModal from "../components/order-payment/OrderPaymentModal";
import ShippingGuideModal from "../components/shipping-guide/ShippingGuideModal";

const PAGE_SIZE = 15;

const OrderList = () => {
  const { orders = [] } = useAllOrder();
  const { query, setQuery, results: queryResults, loading: queryLoading } = useSearchOrder();
  const { dateFrom, setDateFrom, dateTo, setDateTo, results: dateResults, loading: dateLoading } = useFilterOrderByDate();

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const paginated = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const isTextActive = query.trim().length > 0;
  const isDateActive = dateFrom.length > 0;
  const dataToShow = isTextActive ? queryResults : isDateActive ? dateResults : paginated;
  const totalToShow = isTextActive ? queryResults.length : isDateActive ? dateResults.length : orders.length;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetails, setOpenDetails]           = useState(false);
  const [openItems, setOpenItems]               = useState(false);
  const [openPayment, setOpenPayment]           = useState(false);
  const [openShippingGuide, setOpenShippingGuide] = useState(false);

  const handleOpenDetails       = (order) => { setSelectedOrder(order); setOpenDetails(true); };
  const handleOpenItems         = (order) => { setSelectedOrder(order); setOpenItems(true); };
  const handleOpenPayment       = (order) => { setSelectedOrder(order); setOpenPayment(true); };
  const handleOpenShippingGuide = (order) => { setSelectedOrder(order); setOpenShippingGuide(true); };

  return (
    <div className="p-6 space-y-3">
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
    </div>
  );
};

export default OrderList;
