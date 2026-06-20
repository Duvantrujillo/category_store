import { useCallback, useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  allAttribute,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} from "../api/attributeApi";

/* =========================================
   GET ALL ATTRIBUTES
========================================= */

export const useAllAttribute = ({ skip = false } = {}) => {

  const [attributes, setAttributes] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const fetchAttributes = useCallback(async () => {
    if (skip) return;

    try {

      setLoading(true);

      const res = await allAttribute();

      const data =
        res?.data?.data ||
        res?.data ||
        res;

      setAttributes(
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

  }, [skip]);

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAttributes();

  }, [fetchAttributes]);

  return {
    attributes,
    loading,
    error,
    refetch: fetchAttributes,
  };
};

export const useCreateAttribute = () => {

  const [form, setForm] = useState({
    name: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      isActive: true,
    });
  };

  const submitCreate = async () => {

    try {

      setLoading(true);
      setError(null);

      // 🔥 NO se envía slug, lo genera el backend
      const payload = {
        name: form.name,
        isActive: form.isActive,
      };

      const res = await createAttribute(payload);

      setResponse(res);

      toast.success(
        res.message || "Atributo creado correctamente"
      );

      resetForm();

      return res;

    } catch (err) {

      const msg =
        err.response?.data?.message ||
        "Error de conexión";

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
    submitCreate,
    resetForm,
    loading,
    error,
    response,
  };
};

export const useUpdateAttribute = () => {

  const [form, setForm] = useState({
    name: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const setInitialData = (attribute) => {
    setForm({
      name: attribute.name || "",
      isActive: attribute.isActive ?? true,
    });
  };

  const submitUpdate = async (id) => {

    try {

      setLoading(true);
      setError(null);

      const payload = {
        name: form.name,
        isActive: form.isActive,
      };

      const res = await updateAttribute(id, payload);

      setResponse(res);

      toast.success(
        res.message || "Atributo actualizado correctamente"
      );

      return res;

    } catch (err) {

      const msg =
        err.response?.data?.message ||
        "Error de conexión";

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
    setInitialData,
    submitUpdate,
    loading,
    error,
    response,
  };
};
/* =========================================
   DELETE ATTRIBUTE
========================================= */

export const useDeleteAttribute = () => {

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [response, setResponse] =
    useState(null);

  const submitDelete = async (id) => {

    try {

      setLoading(true);

      setError(null);

      const res =
        await deleteAttribute(id);

      setResponse(res);

      toast.success(
        res.message ||
        "Atributo eliminado correctamente"
      );

      return res;

    } catch (err) {

      const msg =
        err.response?.data?.message ||
        "Error de conexión";

      setError(msg);

      toast.error(msg);

      throw err;

    } finally {

      setLoading(false);

    }

  };

  return {
    submitDelete,
    loading,
    error,
    response,
  };
};