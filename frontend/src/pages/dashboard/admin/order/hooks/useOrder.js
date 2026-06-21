import { useCallback, useEffect, useState } from "react";

import { allOrder, searchOrder, filterOrderByDate } from "../api/orderApi";



export const useAllOrder = ({ skip = false } = {}) => {
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!skip) fetchOrders();
  }, [fetchOrders, skip]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
};

export const useSearchOrder = (delay = 400) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await searchOrder(query);
        setResults(res?.orders || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, delay);
    return () => clearTimeout(timer);
  }, [query, delay]);

  return { query, setQuery, results, loading };
};

export const useFilterOrderByDate = (delay = 400) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dateFrom) { setResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await filterOrderByDate(dateFrom, dateTo || dateFrom);
        setResults(res?.orders || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, delay);
    return () => clearTimeout(timer);
  }, [dateFrom, dateTo, delay]);

  return { dateFrom, setDateFrom, dateTo, setDateTo, results, loading };
};