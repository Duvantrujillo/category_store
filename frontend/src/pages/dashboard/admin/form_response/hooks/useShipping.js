import { useEffect, useState, useCallback } from "react";
import { getFormResponses, postFormResponses, updateFormResponse, deleteFormResponse, searchFormResponse } from "../api/shippingApi";
import { toast } from 'react-toastify';


// ======================================================
// 🔹 HOOK: TRAER TODOS LOS REGISTROS (READ)
// ======================================================
export const useShipping = ({ skip = false } = {}) => {
  const [shipping, setShipping] = useState([]);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (skip) return;
    try {
      setLoading(true);

      const data = await getFormResponses();
      setShipping(data);

      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [skip]);

  useEffect(() => {// eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  return {
    shipping,
    loading,
    error,
    loadData,
  }}




// ======================================================
// 🔹 HOOK: CREAR REGISTRO (CREATE)
// ======================================================
export const useCreateShipping = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    documentNumber: "",
    phoneNumber: "",
    address: "",
    additionalDetails: ""
  });

  const [loading, setLoading] = useState(false); // loading request
  const [error, setError] = useState(null);      // errores del backend
  const [response, setResponse] = useState(null); // respuesta exitosa

  // 🔹 actualizar campos del formulario dinámicamente
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // 🔹 enviar formulario al backend
  const submitForm = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await postFormResponses(form);
      setResponse(res);

      toast.success(res.message || "Registro creado correctamente");

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
    submitForm,
    loading,
    error,
    response
  };
};


// ======================================================
// 🔹 HOOK: ACTUALIZAR REGISTRO (UPDATE)
// ======================================================
const useUpdateShipping = () => {

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    documentNumber: "",
    phoneNumber: "",
    address: "",
    additionalDetails: ""
  });

  const [loading, setLoading] = useState(false); // estado loading
  const [error, setError] = useState(null);      // errores
  const [response, setResponse] = useState(null); // respuesta API

  // 🔹 actualiza campos dinámicamente
  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 🔹 actualizar en backend
  const submitUpdate = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await updateFormResponse(id, form);

      setResponse(res);
      toast.success(res.message || "Registro actualizado correctamente");

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
    submitUpdate,
    loading,
    error,
    response,
    setForm
  };
};


// ======================================================
// 🔹 HOOK: ELIMINAR REGISTRO (DELETE)
// ======================================================
export const useDeleteShipping = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitDelete = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await deleteFormResponse(id);
      toast.success(res.message || "Registro eliminado correctamente");
      return res; // Retorna la respuesta por si el componente la necesita
    } catch (err) {
      const msg = err.response?.data?.message || "Error al eliminar el registro";
      setError(msg);
      if (!err._handled) toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitDelete,
    loading,
    error
  };
};

export default useUpdateShipping;

export const useSearchShipping = (delay = 400) => {
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
        const res = await searchFormResponse(query);
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