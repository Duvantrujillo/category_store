import { useCallback, useEffect, useState } from "react";

import { toast } from "react-toastify";

import {
  allPurchaseGift,
  createPurchaseGift,
  updatePurchaseGift,
  deletePurchaseGift,
  searchPurchaseGift,
} from "../api/purchaseGiftApi";

const EMPTY_FORM = {
  name: "",
  description: "",
  minimumPurchase: "",
  productVariantId: null,
  quantity: "1",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  status: "DRAFT",
};

/* =========================================
   GET ALL PURCHASE GIFTS
========================================= */

export const useAllPurchaseGift = ({ skip = false } = {}) => {
  const [purchaseGifts, setPurchaseGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPurchaseGifts = useCallback(async () => {
    if (skip) return;

    try {
      setLoading(true);
      const res = await allPurchaseGift();
      const data = res?.data?.data || res?.data || res;
      setPurchaseGifts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [skip]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPurchaseGifts();
  }, [fetchPurchaseGifts]);

  return {
    purchaseGifts,
    loading,
    error,
    refetch: fetchPurchaseGifts,
  };
};

export const useCreatePurchaseGift = () => {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
  };

  const submitCreate = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await createPurchaseGift(form);

      setResponse(res);
      toast.success(res.message || "Regalo creado correctamente");
      resetForm();

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

  return { form, handleChange, submitCreate, resetForm, loading, error, response };
};

export const useUpdatePurchaseGift = () => {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setInitialData = (gift) => {
    setForm({
      name: gift.name || "",
      description: gift.description || "",
      minimumPurchase: gift.minimumPurchase != null ? String(gift.minimumPurchase) : "",
      productVariantId: gift.productVariant?.id ?? null,
      quantity: gift.quantity != null ? String(gift.quantity) : "1",
      usageLimit: gift.usageLimit != null ? String(gift.usageLimit) : "",
      startsAt: gift.startsAt ? gift.startsAt.slice(0, 10) : "",
      expiresAt: gift.expiresAt ? gift.expiresAt.slice(0, 10) : "",
      status: gift.status || "DRAFT",
    });
  };

  const submitUpdate = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const res = await updatePurchaseGift(id, form);

      setResponse(res);
      toast.success(res.message || "Regalo actualizado correctamente");

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

  return { form, handleChange, setInitialData, submitUpdate, loading, error, response };
};

/* =========================================
   DELETE PURCHASE GIFT
========================================= */

export const useDeletePurchaseGift = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const submitDelete = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const res = await deletePurchaseGift(id);

      setResponse(res);
      toast.success(res.message || "Regalo eliminado correctamente");

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

  return { submitDelete, loading, error, response };
};

export const useSearchPurchaseGift = (delay = 400) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setLoading(false); return; }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await searchPurchaseGift(query);
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
