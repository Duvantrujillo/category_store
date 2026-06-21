import { useState } from "react";
import { toast } from 'react-toastify';
import { useCallback, useEffect } from "react";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  allProduct,
  searchProduct
} from "../api/productApi";

/* =========================================
   CREATE PRODUCT
========================================= */

export const useCreateProduct = () => {
  const [form, setForm] = useState({
    categoryId: "",
    brandId: "",
    name: "",
    shortDescription: "",
    description: "",
    mainImage: null,
    preview: "",
    status: "DRAFT",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [response, setResponse] =
    useState(null);

  const handleChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      categoryId: "",
      brandId: "",
      name: "",
      shortDescription: "",
      description: "",
      mainImage: null,
      preview: "",
      status: "DRAFT",
    });
  };

  const submitCreate = async () => {
    try {
      setLoading(true);
      setError(null);

      const formData =
        new FormData();

      formData.append(
        "categoryId",
        form.categoryId
      );

      if (form.brandId) {
        formData.append(
          "brandId",
          form.brandId
        );
      }

      formData.append(
        "name",
        form.name
      );

      formData.append(
        "shortDescription",
        form.shortDescription ||
        ""
      );

      formData.append(
        "description",
        form.description ||
        ""
      );

      formData.append(
        "status",
        form.status
      );

      if (form.mainImage) {
        formData.append(
          "mainImage",
          form.mainImage
        );
      }

      const res =
        await createProduct(
          formData
        );

      setResponse(res);

      toast.success(
        res.message ||
        "Producto creado correctamente"
      );

      resetForm();

      return res;
    } catch (err) {
      const msg =
        err.response?.data
          ?.message ||
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
    resetForm,
    submitCreate,
    loading,
    error,
    response,
  };
};

/* =========================================
   UPDATE PRODUCT
========================================= */

export const useUpdateProduct = () => {
  const [form, setForm] = useState({
    categoryId: "",
    brandId: "",
    name: "",
    shortDescription: "",
    description: "",
    mainImage: null,
    preview: "",
    status: "DRAFT",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [response, setResponse] =
    useState(null);

  const handleChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const setInitialData = (
    product
  ) => {
    setForm({
      categoryId:
        product.categoryId || "",
      brandId:
        product.brandId || "",
      name:
        product.name || "",
      shortDescription:
        product.shortDescription ||
        "",
      description:
        product.description ||
        "",
      mainImage: null,
      preview:
        product.mainImage || "",
      status:
        product.status ||
        "DRAFT",
    });
  };

  const submitUpdate =
    async (id) => {
      try {
        setLoading(true);
        setError(null);

        const formData =
          new FormData();

        formData.append(
          "categoryId",
          form.categoryId
        );

        if (form.brandId) {
          formData.append(
            "brandId",
            form.brandId
          );
        }

        formData.append(
          "name",
          form.name
        );

        formData.append(
          "shortDescription",
          form.shortDescription ||
          ""
        );

        formData.append(
          "description",
          form.description ||
          ""
        );

        formData.append(
          "status",
          form.status
        );

        if (form.mainImage) {
          formData.append(
            "mainImage",
            form.mainImage
          );
        }

        const res =
          await updateProduct(
            id,
            formData
          );

        setResponse(res);

        toast.success(
          res.message ||
          "Producto actualizado correctamente"
        );

        return res;
      } catch (err) {
        const msg =
          err.response?.data
            ?.message ||
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
   DELETE PRODUCT
========================================= */

export const useDeleteProduct = () => {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [response, setResponse] =
    useState(null);

  const submitDelete =
    async (id) => {
      try {
        setLoading(true);
        setError(null);

        const res =
          await deleteProduct(id);

        setResponse(res);

        toast.success(
          res.message ||
          "Producto eliminado correctamente"
        );

        return res;
      } catch (err) {
        const msg =
          err.response?.data
            ?.message ||
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

export const useAllProduct = ({ skip = false } = {}) => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    if (skip) return;
    try {
      setLoading(true);

      const res = await allProduct();

      const data =
        res?.data?.data ||
        res?.data ||
        res;

      setProducts(
        Array.isArray(data) ? data : []
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
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
};

export const useSearchProduct = (
  delay = 400
) => {

  const [query, setQuery] = useState("");

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {

    if (!query.trim()) {

      setResults([]);

      return;

    }

    const timer = setTimeout(
      async () => {

        try {

          setLoading(true);

          const res =
            await searchProduct(
              query
            );

          const data =
            res?.data || [];

          setResults(data);

        } catch (error) {

          console.error(error);

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

  return {
    query,
    setQuery,
    results,
    loading,
  };

};