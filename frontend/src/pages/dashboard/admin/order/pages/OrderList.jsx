import { useState } from "react";

import { useAllOrder } from "../hooks/useOrder";

import OrderTable from "../components/order-list/OrderTable";

import OrderDetailsModal from "../components/order-details/OrderDetailsModal";
import OrderItemsModal from "../components/order-items/OrderItemsModal";
import OrderPaymentModal from "../components/order-payment/OrderPaymentModal";

const OrderList = () => {
  const { orders } = useAllOrder();

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [openDetails, setOpenDetails] = useState(false);

  const [openItems, setOpenItems] = useState(false);

  const [openPayment, setOpenPayment] = useState(false);

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setOpenDetails(true);
  };

  const handleOpenItems = (order) => {
    setSelectedOrder(order);
    setOpenItems(true);
  };

  const handleOpenPayment = (order) => {
    setSelectedOrder(order);
    setOpenPayment(true);
  };

  return (
    <>
      <OrderTable
        orders={orders}
        onOpenDetails={handleOpenDetails}
        onOpenItems={handleOpenItems}
        onOpenPayment={handleOpenPayment}
      />

      <OrderDetailsModal
        open={openDetails}
        order={selectedOrder}
        onClose={() => setOpenDetails(false)}
      />

      <OrderItemsModal
        open={openItems}
        order={selectedOrder}
        onClose={() => setOpenItems(false)}
      />

      <OrderPaymentModal
        open={openPayment}
        order={selectedOrder}
        onClose={() => setOpenPayment(false)}
      />
    </>
  );
};

export default OrderList;