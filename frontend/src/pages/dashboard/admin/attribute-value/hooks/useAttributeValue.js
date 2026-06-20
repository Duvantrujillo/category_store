import { useCallback, useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  allAtributeValue,
  createAtributeValue,
  updateAtributeValue,
  deleteAtributeValue,
} from "../api/attribute-value";

/* =========================================
   GET ALL ATTRIBUTE VALUES
========================================= */

export const useAllAttributeValue = ({ skip = false } = {}) => {

  const [attributeValues, setAttributeValues] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const fetchAttributeValues = useCallback(async () => {
    if (skip) return;

    try {

      setLoading(true);

      const res = await allAtributeValue();

      const data =
        res?.data?.data ||
        res?.data ||
        res;

      setAttributeValues(
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
    fetchAttributeValues();

  }, [fetchAttributeValues]);

  return {
    attributeValues,
    loading,
    error,
    refetch: fetchAttributeValues,
  };
};

/* =========================================
   CREATE ATTRIBUTE VALUE
========================================= */

export const useCreateAttributeValue = () => {

  const [form, setForm] = useState({
    value: "",
    attributeId: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [response, setResponse] =
    useState(null);

  const handleChange = (field, value) => {

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

  };

  const resetForm = () => {

    setForm({
      value: "",
      attributeId: "",
    });

  };

  const submitCreate = async () => {

    try {

      setLoading(true);

      setError(null);

      // 🔥 slug lo genera el backend
      const payload = {
        value: form.value,
        attributeId: Number(form.attributeId),
      };

      const res =
        await createAtributeValue(payload);

      setResponse(res);

      toast.success(
        res.message ||
        "Valor creado correctamente"
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

/* =========================================
   UPDATE ATTRIBUTE VALUE
========================================= */

export const useUpdateAttributeValue = () => {

  const [form, setForm] = useState({
    value: "",
    attributeId: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [response, setResponse] =
    useState(null);

  const handleChange = (field, value) => {

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

  };

  const setInitialData = (
    attributeValue
  ) => {

    setForm({
      value:
        attributeValue.value || "",
      attributeId:
        attributeValue.attributeId || "",
    });

  };

  const submitUpdate = async (id) => {

    try {

      setLoading(true);

      setError(null);

      const payload = {
        value: form.value,
        attributeId: Number(
          form.attributeId
        ),
      };

      const res =
        await updateAtributeValue(
          id,
          payload
        );

      setResponse(res);

      toast.success(
        res.message ||
        "Valor actualizado correctamente"
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
   DELETE ATTRIBUTE VALUE
========================================= */

export const useDeleteAttributeValue = () => {

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
        await deleteAtributeValue(id);

      setResponse(res);

      toast.success(
        res.message ||
        "Valor eliminado correctamente"
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