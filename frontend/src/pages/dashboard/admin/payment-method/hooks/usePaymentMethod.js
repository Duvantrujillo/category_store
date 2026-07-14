import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  allPaymentMethodsAdmin,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "../api/paymentMethodApi";

export const useAllPaymentMethod = ({ skip = false } = {}) => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMethods = useCallback(async () => {
    if (skip) return;
    try {
      setLoading(true);
      const res = await allPaymentMethodsAdmin();
      const data = res?.data?.data || res?.data || res;
      setMethods(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [skip]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMethods();
  }, [fetchMethods]);

  return { methods, loading, error, refetch: fetchMethods };
};

const EMPTY_FORM = { name: "", type: "DIGITAL_WALLET", isActive: true };

export const useCreatePaymentMethod = () => {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const resetForm = () => setForm({ ...EMPTY_FORM });

  const submitCreate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await createPaymentMethod(form);
      setResponse(res);
      toast.success(res.message || "Método de pago creado correctamente");
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

export const useUpdatePaymentMethod = () => {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const setInitialData = (method) => {
    setForm({
      name: method.name || "",
      type: method.type || "DIGITAL_WALLET",
      isActive: method.isActive ?? true,
    });
  };

  const submitUpdate = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updatePaymentMethod(id, form);
      setResponse(res);
      toast.success(res.message || "Método de pago actualizado correctamente");
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

export const useDeletePaymentMethod = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const submitDelete = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await deletePaymentMethod(id);
      setResponse(res);
      toast.success(res.message || "Método de pago eliminado correctamente");
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
