import { useEffect, useState } from "react";
import { getFormResponses, postFormResponses, updateFormResponse } from "../api/shippingApi";
import toast from "react-hot-toast";


// ======================================================
// 🔹 HOOK: TRAER TODOS LOS REGISTROS (READ)
// ======================================================
export const useShipping = () => {
  const [shipping, setShipping] = useState([]); // lista de registros
  const [loading, setLoading] = useState(true);  // estado de carga
  const [error, setError] = useState(null);      // manejo de errores

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getFormResponses(); // petición al backend
        setShipping(data); // guardamos datos
      } catch (err) {
        setError(err); // guardamos error
      } finally {
        setLoading(false); // terminamos loading
      }
    };

    loadData();
  }, []);

  return {
    shipping,
    loading,
    error,
  };
};


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

      toast.error(msg);

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

      toast.error(msg);

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

export default useUpdateShipping;