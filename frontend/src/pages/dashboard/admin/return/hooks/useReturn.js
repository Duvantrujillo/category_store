import { useState, useCallback, useEffect } from "react";
import { toast } from 'react-toastify';
import {
  allReturnRequests,
  createReturnRequest,
  updateReturnRequest,
  createReturnItems,
  createRefund,
  processRefund,
  searchReturn,
} from "../api/returnApi";

/* =========================================
   CREATE RETURN REQUEST
========================================= */

export const useCreateReturnRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitCreate = async (form) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        orderId: form.orderId,
        status: form.status || "PENDING",
        resolution: form.resolution || undefined,
        reason: form.reason || undefined,
      };

      const res = await createReturnRequest(payload);
      const returnRequestId = res.data.id;

      if (form.selectedItems?.length > 0) {
        await createReturnItems(
          returnRequestId,
          form.selectedItems.map((i) => ({
            orderItem: i.orderItemId,
            quantity: i.quantity,
          }))
        );
      }

      toast.success(res.message || "Solicitud creada correctamente");
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message || "Error de conexión";
      setError(msg);
      if (!err._handled) toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitCreate, loading, error };
};

/* =========================================
   GET ALL RETURN REQUESTS
========================================= */

export const useAllReturn = ({ skip = false } = {}) => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReturns = useCallback(async () => {
    if (skip) return;
    try {
      setLoading(true);
      const data = await allReturnRequests();
      setReturns(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [skip]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  return { returns, loading, error, refetch: fetchReturns };
};

/* =========================================
   UPDATE RETURN REQUEST STATUS
========================================= */

export const useUpdateReturn = () => {
  const [form, setForm] = useState({
    orderNumber: "",
    status: "",
    resolution: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setInitialData = (item) => {
    setForm({
      orderNumber: item.orderNumber || "",
      status: item.status || "",
      resolution: item.resolution || "",
      reason: item.reason || "",
    });
  };

  const submitUpdate = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        status: form.status || undefined,
        resolution: form.resolution || null,
        reason: form.reason || null,
      };

      const res = await updateReturnRequest(id, payload);
      toast.success(res.message || "Solicitud actualizada");
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Error de conexión";
      setError(msg);
      if (!err._handled) toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { form, handleChange, setInitialData, submitUpdate, loading, error };
};

/* =========================================
   CREATE REFUND
========================================= */

export const useCreateRefund = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitCreate = async (returnRequestId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createRefund(returnRequestId);
      toast.success(res.message || "Reembolso creado correctamente");
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Error de conexión";
      setError(msg);
      if (!err._handled) toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitCreate, loading, error };
};

/* =========================================
   PROCESS REFUND
========================================= */

export const useProcessRefund = () => {
  const [form, setForm] = useState({ method: "", reference: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = useCallback(() => {
    setForm({ method: "", reference: "" });
  }, []);

  const submitProcess = async (refundId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await processRefund(refundId, form.method, form.reference);
      toast.success(res.message || "Reembolso procesado correctamente");
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Error de conexión";
      setError(msg);
      if (!err._handled) toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { form, handleChange, resetForm, submitProcess, loading, error };
};

export const useSearchReturn = (delay = 400) => {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setLoading(false); return; }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await searchReturn(query);
        setResults(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        setError(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return { query, setQuery, results, loading, error };
};
