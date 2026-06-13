import { useCallback, useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  AllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  searchBrand
} from "../api/brandApi";

/* =========================================
   GET ALL BRANDS
========================================= */

export const useAllBrand = () => {

  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const fetchBrands = useCallback(async () => {

    try {

      setLoading(true);

      const res = await AllBrands();

      const data =
        res?.data?.data ||
        res?.data ||
        res;

      setBrands(
        Array.isArray(data)
          ? data
          : []
      );

      setError(null);

    } catch (err) {

      setError(err);

      toast.error(
        "Error loading brands"
      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBrands();

  }, [fetchBrands]);

  return {
    brands,
    loading,
    error,
    refetch: fetchBrands,
  };

};

/* =========================================
   CREATE BRAND
========================================= */

export const useCreateBrand = () => {

  const [form, setForm] = useState({
    name: "",
    description: "",
    logo: null,
    preview: "",
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
      description: "",
      logo: null,
      preview: "",
      isActive: true,
    });

  };

  const submitCreate = async () => {

    try {

      setLoading(true);

      setError(null);

      const formData = new FormData();

      formData.append(
        "name",
        form.name
      );

      formData.append(
        "description",
        form.description || ""
      );

      formData.append(
        "isActive",
        form.isActive
      );

      if (form.logo) {

        formData.append(
          "logo",
          form.logo
        );

      }

      const res =
        await createBrand(formData);

      setResponse(res);

      toast.success(
        res.message ||
        "Marca creada correctamente"
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
   UPDATE BRAND
========================================= */

export const useUpdateBrand = () => {

  const [form, setForm] = useState({
    name: "",
    description: "",
    logo: null,
    preview: "",
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

  const setInitialData = (brand) => {

    setForm({
      name: brand.name || "",
      description:
        brand.description || "",
      logo: null,
      preview:
        brand.logoUrl || "",
      isActive:
        brand.isActive ?? true,
    });

  };

  const submitUpdate = async (id) => {

    try {

      setLoading(true);

      setError(null);

      const formData =
        new FormData();

      formData.append(
        "name",
        form.name
      );

      formData.append(
        "description",
        form.description || ""
      );

      formData.append(
        "isActive",
        form.isActive
      );

      if (form.logo) {

        formData.append(
          "logo",
          form.logo
        );

      }

      const res =
        await updateBrand(
          id,
          formData
        );

      setResponse(res);

      toast.success(
        res.message ||
        "Marca actualizada correctamente"
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
   DELETE BRAND
========================================= */

export const useDeleteBrand = () => {

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
        await deleteBrand(id);

      setResponse(res);

      toast.success(
        res.message ||
        "Marca eliminada correctamente"
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

export const useSearchBrand = (
  delay = 400
) => {

  const [query, setQuery] = useState("");

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  useEffect(() => {

    if (!query.trim()) {

      setResults([]);

      setLoading(false);

      return;

    }

    const timer = setTimeout(
      async () => {

        try {

          setLoading(true);

          setError(null);

          const res =
            await searchBrand(
              query
            );

          const data =
            res?.data || [];

          setResults(data);

        } catch (err) {

          console.error(err);

          setError(err);

          setResults([]);

        } finally {

          setLoading(false);

        }

      },
      delay
    );

    return () =>
      clearTimeout(timer);

  }, [query, delay]);

  const clearSearch = () => {

    setQuery("");

    setResults([]);

    setError(null);

  };

  return {

    query,

    setQuery,

    results,

    loading,

    error,

    clearSearch,

  };

};