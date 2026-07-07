import { useCallback, useEffect, useState } from "react";

import { toast } from 'react-toastify';

import {
  AllProductBundles,
  createProductBundle,
  updateProductBundle,
  deleteProductBundle,
  searchProductBundle
} from "../api/productBundleApi";

/* =========================================
   GET ALL BUNDLES
========================================= */

export const useAllProductBundle = ({ skip = false } = {}) => {

  const [bundles, setBundles] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const fetchBundles = useCallback(async () => {
    if (skip) return;

    try {

      setLoading(true);

      const res = await AllProductBundles();

      const data =
        res?.data?.data ||
        res?.data ||
        res;

      setBundles(
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
    fetchBundles();

  }, [fetchBundles]);

  return {
    bundles,
    loading,
    error,
    refetch: fetchBundles,
  };

};

/* =========================================
   FORM POR DEFECTO
========================================= */

const emptyForm = () => ({
  name: "",
  description: "",
  price: "",
  mainImage: null,
  preview: "",
  isActive: true,
  items: [],
});

/* =========================================
   CREATE BUNDLE
========================================= */

export const useCreateProductBundle = () => {

  const [form, setForm] = useState(emptyForm());

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

    setForm(emptyForm());

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
        "price",
        form.price
      );

      formData.append(
        "isActive",
        form.isActive
      );

      formData.append(
        "items",
        JSON.stringify(
          (form.items || []).map((item) => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
          }))
        )
      );

      if (form.mainImage) {

        formData.append(
          "mainImage",
          form.mainImage
        );

      }

      const res =
        await createProductBundle(formData);

      setResponse(res);

      toast.success(
        res.message ||
        "Combo creado correctamente"
      );

      resetForm();

      return res;

    } catch (err) {

      const msg =
        err.response?.data?.message ||
        "Error de conexión";

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
    submitCreate,
    resetForm,
    loading,
    error,
    response,
  };

};

/* =========================================
   UPDATE BUNDLE
========================================= */

export const useUpdateProductBundle = () => {

  const [form, setForm] = useState(emptyForm());

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [response, setResponse] = useState(null);

  const handleChange = (field, value) => {

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

  };

  const setInitialData = (bundle) => {

    setForm({
      name: bundle.name || "",
      description:
        bundle.description || "",
      price:
        bundle.price ?? "",
      mainImage: null,
      preview:
        bundle.mainImage || "",
      isActive:
        bundle.isActive ?? true,
      items:
        (bundle.items || []).map((item) => {
          // `product.variants` ya viene filtrado a activas — si la variante
          // fija quedó inactiva después de armar el combo, se agrega igual
          // para no perderla del selector al editar.
          const variants = item.product?.variants ? [...item.product.variants] : [];
          if (
            item.productVariantId &&
            item.productVariant &&
            !variants.some((v) => v.id === item.productVariantId)
          ) {
            variants.push(item.productVariant);
          }
          return {
            productId: item.productId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            product: { id: item.productId, name: item.product?.name, variants },
          };
        }),
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
        "price",
        form.price
      );

      formData.append(
        "isActive",
        form.isActive
      );

      formData.append(
        "items",
        JSON.stringify(
          (form.items || []).map((item) => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
          }))
        )
      );

      if (form.mainImage) {

        formData.append(
          "mainImage",
          form.mainImage
        );

      }

      const res =
        await updateProductBundle(
          id,
          formData
        );

      setResponse(res);

      toast.success(
        res.message ||
        "Combo actualizado correctamente"
      );

      return res;

    } catch (err) {

      const msg =
        err.response?.data?.message ||
        "Error de conexión";

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
    setInitialData,
    submitUpdate,
    loading,
    error,
    response,
  };

};

/* =========================================
   DELETE BUNDLE
========================================= */

export const useDeleteProductBundle = () => {

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
        await deleteProductBundle(id);

      setResponse(res);

      toast.success(
        res.message ||
        "Combo eliminado correctamente"
      );

      return res;

    } catch (err) {

      const msg =
        err.response?.data?.message ||
        "Error de conexión";

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
    error,
    response,
  };

};

export const useSearchProductBundle = (
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
            await searchProductBundle(
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
