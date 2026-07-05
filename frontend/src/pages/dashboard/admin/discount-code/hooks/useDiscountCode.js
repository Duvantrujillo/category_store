import { useCallback, useEffect, useState } from "react";

import { toast } from "react-toastify";

import {
  allDiscountCode,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  searchDiscountCode,
} from "../api/discountCodeApi";

const EMPTY_FORM = {
  code: "",
  description: "",
  type: "PERCENTAGE",
  value: "",
  minimumPurchase: "0",
  maxUses: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
  productIds: [],
  categoryIds: [],
  brandIds: [],
};

/* =========================================
   GET ALL DISCOUNT CODES
========================================= */

export const useAllDiscountCode = ({ skip = false } = {}) => {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDiscountCodes = useCallback(async () => {
    if (skip) return;

    try {
      setLoading(true);
      const res = await allDiscountCode();
      const data = res?.data?.data || res?.data || res;
      setDiscountCodes(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [skip]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDiscountCodes();
  }, [fetchDiscountCodes]);

  return {
    discountCodes,
    loading,
    error,
    refetch: fetchDiscountCodes,
  };
};

export const useCreateDiscountCode = () => {
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

      const res = await createDiscountCode(form);

      setResponse(res);
      toast.success(res.message || "Cupón creado correctamente");
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

export const useUpdateDiscountCode = () => {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setInitialData = (discountCode) => {
    setForm({
      code: discountCode.code || "",
      description: discountCode.description || "",
      type: discountCode.type || "PERCENTAGE",
      value: discountCode.value != null ? String(discountCode.value) : "",
      minimumPurchase: discountCode.minimumPurchase != null ? String(discountCode.minimumPurchase) : "0",
      maxUses: discountCode.maxUses != null ? String(discountCode.maxUses) : "",
      startsAt: discountCode.startsAt ? discountCode.startsAt.slice(0, 10) : "",
      expiresAt: discountCode.expiresAt ? discountCode.expiresAt.slice(0, 10) : "",
      isActive: discountCode.isActive ?? true,
      productIds: (discountCode.products || []).map((p) => p.product.id),
      categoryIds: (discountCode.categories || []).map((c) => c.category.id),
      brandIds: (discountCode.brands || []).map((b) => b.brand.id),
    });
  };

  const submitUpdate = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const res = await updateDiscountCode(id, form);

      setResponse(res);
      toast.success(res.message || "Cupón actualizado correctamente");

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
   DELETE DISCOUNT CODE
========================================= */

export const useDeleteDiscountCode = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const submitDelete = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const res = await deleteDiscountCode(id);

      setResponse(res);
      toast.success(res.message || "Cupón eliminado correctamente");

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

export const useSearchDiscountCode = (delay = 400) => {
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
        const res = await searchDiscountCode(query);
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
