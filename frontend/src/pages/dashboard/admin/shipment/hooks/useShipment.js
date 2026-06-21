import { useState, useCallback, useEffect } from "react";
import { toast } from 'react-toastify';
import { allshipment, updateShipment, getShipmentHistory, searchShipment } from "../api/shipmentApi";

export const useAllShipment = ({ skip = false } = {}) => {
  const [shipments, setShipments] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const fetchShipments = useCallback(async () => {
    if (skip) return;
    try {
      setLoading(true);

      const res = await allshipment();

      const data =
        res?.data?.data ||
        res?.data ||
        res;

      setShipments(
        Array.isArray(data) ? data : []
      );

      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [skip]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  return {
    shipments,
    loading,
    error,
    refetch: fetchShipments,
  };
};

export const useUpdateShipment = () => {
  const [form, setForm] = useState({
    status: "",
    carrier: "",
    trackingNumber: "",
    note: "",
    shippedAt: "",
    deliveredAt: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setInitialData = (shipment) => {
    setForm({
      status: shipment.status || "",
      carrier: shipment.carrier || "",
      trackingNumber: shipment.trackingNumber || "",
      note: "",
      shippedAt: shipment.shippedAt
        ? new Date(shipment.shippedAt).toISOString().split("T")[0]
        : "",
      deliveredAt: shipment.deliveredAt
        ? new Date(shipment.deliveredAt).toISOString().split("T")[0]
        : "",
    });
  };

  const submitUpdate = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        status: form.status,
        carrier: form.carrier || null,
        trackingNumber: form.trackingNumber || null,
        note: form.note || null,
        shippedAt: form.shippedAt || null,
        deliveredAt: form.deliveredAt || null,
      };

      const res = await updateShipment(id, payload);

      toast.success(res.message || "Envío actualizado correctamente");

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

  return {
    form,
    handleChange,
    setInitialData,
    submitUpdate,
    loading,
    error,
  };
};

export const useShipmentHistory = () => {
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (shipmentId) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getShipmentHistory(shipmentId);

      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      if (!err._handled) toast.error("Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setHistory([]), []);

  return {
    history,
    loading,
    error,
    fetchHistory,
    reset,
  };
};

export const useSearchShipment = (delay = 400) => {
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
        const res = await searchShipment(query);
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
