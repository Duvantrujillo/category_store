import { useEffect, useState } from "react";
import { useAllOrder } from "../hooks/useOrder";
import OrderTable from "../components/order-list/OrderTable";
import OrderDetailsModal from "../components/order-details/OrderDetailsModal";
import OrderItemsModal from "../components/order-items/OrderItemsModal";
import OrderPaymentModal from "../components/order-payment/OrderPaymentModal";

const PAGE_SIZE = 15;

const OrderList = () => {
  const { orders = [] } = useAllOrder();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const paginated = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetails, setOpenDetails]     = useState(false);
  const [openItems, setOpenItems]         = useState(false);
  const [openPayment, setOpenPayment]     = useState(false);

  const handleOpenDetails = (order) => { setSelectedOrder(order); setOpenDetails(true); };
  const handleOpenItems   = (order) => { setSelectedOrder(order); setOpenItems(true); };
  const handleOpenPayment = (order) => { setSelectedOrder(order); setOpenPayment(true); };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Órdenes</h1>
          <p className="text-muted-foreground">Administra y consulta los pedidos del sistema.</p>
        </div>
      </div>

      <OrderTable
        orders={paginated}
        totalItems={orders.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onOpenDetails={handleOpenDetails}
        onOpenItems={handleOpenItems}
        onOpenPayment={handleOpenPayment}
      />

      <OrderDetailsModal open={openDetails} order={selectedOrder} onClose={() => setOpenDetails(false)} />
      <OrderItemsModal   open={openItems}   order={selectedOrder} onClose={() => setOpenItems(false)} />
      <OrderPaymentModal open={openPayment} order={selectedOrder} onClose={() => setOpenPayment(false)} />
    </div>
  );
};

export default OrderList;
