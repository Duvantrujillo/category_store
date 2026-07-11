import { useCallback, useEffect, useState } from "react";

import { toast } from "react-toastify";

import {
  allPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  searchPromotion,
} from "../api/promotionApi";

const EMPTY_FORM = {
  name: "",
  description: "",
  type: "PERCENTAGE",
  value: "",
  scope: "ALL_PRODUCTS",
  minimumPurchase: "0",
  allowCombination: false,
  usageLimit: "",
  usagePerCustomer: "",
  startsAt: "",
  expiresAt: "",
  status: "DRAFT",
  productIds: [],
  categoryIds: [],
  brandIds: [],
  variantIds: [],
};

/* =========================================
   GET ALL PROMOTIONS
========================================= */

export const useAllPromotion = ({ skip = false } = {}) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPromotions = useCallback(async () => {
    if (skip) return;

    try {
      setLoading(true);
      const res = await allPromotion();
      const data = res?.data?.data || res?.data || res;
      setPromotions(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [skip]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPromotions();
  }, [fetchPromotions]);

  return {
    promotions,
    loading,
    error,
    refetch: fetchPromotions,
  };
};

export const useCreatePromotion = () => {
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

      const res = await createPromotion(form);

      setResponse(res);
      toast.success(res.message || "Promoción creada correctamente");
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

export const useUpdatePromotion = () => {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setInitialData = (promotion) => {
    setForm({
      name: promotion.name || "",
      description: promotion.description || "",
      type: promotion.type || "PERCENTAGE",
      value: promotion.value != null ? String(promotion.value) : "",
      scope: promotion.scope || "ALL_PRODUCTS",
      minimumPurchase: promotion.minimumPurchase != null ? String(promotion.minimumPurchase) : "0",
      allowCombination: promotion.allowCombination ?? false,
      usageLimit: promotion.usageLimit != null ? String(promotion.usageLimit) : "",
      usagePerCustomer: promotion.usagePerCustomer != null ? String(promotion.usagePerCustomer) : "",
      startsAt: promotion.startsAt ? promotion.startsAt.slice(0, 10) : "",
      expiresAt: promotion.expiresAt ? promotion.expiresAt.slice(0, 10) : "",
      status: promotion.status || "DRAFT",
      productIds: (promotion.products || []).map((p) => p.product.id),
      categoryIds: (promotion.categories || []).map((c) => c.category.id),
      brandIds: (promotion.brands || []).map((b) => b.brand.id),
      variantIds: (promotion.variants || []).map((v) => v.productVariant.id),
    });
  };

  const submitUpdate = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const res = await updatePromotion(id, form);

      setResponse(res);
      toast.success(res.message || "Promoción actualizada correctamente");

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
   DELETE PROMOTION
========================================= */

export const useDeletePromotion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const submitDelete = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const res = await deletePromotion(id);

      setResponse(res);
      toast.success(res.message || "Promoción eliminada correctamente");

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

export const useSearchPromotion = (delay = 400) => {
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
        const res = await searchPromotion(query);
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
