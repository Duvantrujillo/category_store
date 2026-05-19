import { useEffect, useState } from "react";
import { getFormResponses } from "../api/shippingApi";
import {postFormResponses} from "../api/shippingApi";
import toast from "react-hot-toast";


//esta funcion lo que hace es traer todos los datos
export const useShipping = () => {
  const [shipping, setShipping] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getFormResponses();
        setShipping(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
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


//esta lo que hace es crear
export const useCreateShipping = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    documentNumber: "",
    phoneNumber: "",
    address: "",
    additionalDetails: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  // Actualiza los campos del formulario dinámicamente
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Envía el formulario al backend
  const submitForm = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await postFormResponses(form); // Enviamos los datos al backend
      setResponse(res);

      // Notificación de éxito
      toast.success(res.message || "Registro procesado correctamente");

      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Error de conexión";
      setError(msg);

      // Notificación de error
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