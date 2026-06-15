import { useCallback, useEffect, useState } from "react";

import toast from "react-hot-toast";

import { allOrder } from "../api/orderApi";



export const useAllOrder = () => {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const res = await allOrder();

      const data =
        res?.orders ||
        res?.data?.orders ||
        res?.data ||
        res;

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );

      setError(null);
    } catch (err) {
      setError(err);

      toast.error(
        "Error loading orders"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
};