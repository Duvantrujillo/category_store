import { useCallback, useEffect, useState } from "react";

import toast from "react-hot-toast";

import { createProductVariant, allProductVariant, updateProductVariant, deleteProductVariant, searchSkuBarcode} from "../api/product-variantApi";

/* =========================================
   CREATE PRODUCT VARIANT
========================================= */

export const useCreateProductVariant = () => {

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [response, setResponse] = useState(null);

  const submitCreate = async (formData) => {

    try {

      setLoading(true);

      setError(null);

      const res =
        await createProductVariant(formData);

      setResponse(res);

      toast.success(
        res?.message ||
        "Variante creada correctamente"
      );

      return res;

    } catch (err) {

      const msg =
        err?.response?.data?.message ||
        "Error de conexión";

      setError(msg);

      toast.error(msg);

      throw err;

    } finally {

      setLoading(false);

    }

  };

  return {
    submitCreate,
    loading,
    error,
    response,
  };

};
export const useAllProductVariant = ({ skip = false } = {}) => {

  const [variants, setVariants] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const fetchVariants = useCallback(async () => {
    if (skip) return;

    try {

      setLoading(true);

      const res =
        await allProductVariant();

      const data =
        res?.data?.data ||
        res?.data ||
        res;

      setVariants(
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
    fetchVariants();

  }, [fetchVariants]);

  return {
    variants,
    loading,
    error,
    refetch: fetchVariants,
  };

};


export const useUpdateProductVariant = () => {

  const [form, setForm] = useState({

    productId: "",
    barcode: "",
    price: "",
    stock: "",
    isDefault: false,
    isActive: true,
    attributes: [],
    images: [null, null, null, null],
    mainImage: null,
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [response, setResponse] = useState(null);

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
    variant
  ) => {
    const imgs = [null, null, null, null];
    let mainImg = null;

    // map existing images by slot: slot 1 -> mainImage, slot 2-5 -> imgs[0..3]
    (variant?.images || []).forEach((img) => {
      const slot = Number(img.slot);
      if (slot === 1) {
        mainImg = img.imageUrl; // keep URL string
      } else if (slot >= 2 && slot <= 5) {
        imgs[slot - 2] = img.imageUrl;
      }
    });

    setForm({
      productId:
        variant?.productId || "",

      barcode:
        variant?.barcode || "",

      price:
        variant?.price || "",

      stock:
        variant?.stock || "",

      isDefault:
        variant?.isDefault ?? false,

      isActive:
        variant?.isActive ?? true,

      attributes:
        variant?.attributes?.map(
          (item) => ({
            valueId:
              item.attributeValueId,
          })
        ) || [],

      images: imgs,
      mainImage: mainImg,
    });

  };

  const submitUpdate = async (
    id
  ) => {

    try {

      setLoading(true);

      setError(null);

      const formData = new FormData();

      formData.append(
        "productId",
        form.productId
      );

      formData.append(
        "barcode",
        form.barcode
      );

      formData.append(
        "price",
        form.price
      );

      formData.append(
        "stock",
        form.stock
      );

      formData.append(
        "isDefault",
        form.isDefault
      );

      formData.append(
        "isActive",
        form.isActive
      );

      formData.append(
        "attributes",
        JSON.stringify(
          form.attributes
        )
      );

      const keptSlots = [];
      const imageSlots = [];

      if (form.mainImage instanceof File) {
        formData.append("images", form.mainImage);
        imageSlots.push(1);
      } else if (typeof form.mainImage === "string" && form.mainImage) {
        keptSlots.push(1);
      }

      if (Array.isArray(form.images) && form.images.length) {
        form.images.forEach((file, idx) => {
          const slot = idx + 2;

          if (file instanceof File) {
            formData.append("images", file);
            imageSlots.push(slot);
            return;
          }

          if (typeof file === "string" && file) {
            keptSlots.push(slot);
          }
        });
      }

      formData.append("keptSlots", JSON.stringify(keptSlots));

      if (imageSlots.length) {
        formData.append("imageSlots", JSON.stringify(imageSlots));
      }

      const res = await updateProductVariant(id, formData);

      setResponse(res);

      toast.success(
        res?.message ||
        "Variante actualizada correctamente"
      );

      return res;

    } catch (err) {

      const msg =
        err?.response?.data?.message ||
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
    submitUpdate,
    setInitialData,
    loading,
    error,
    response,
  };

};

export const useDeleteProductVariant = () => {

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const submitDelete = async (id) => {

    try {

      setLoading(true);

      setError(null);

      const res =
        await deleteProductVariant(id);

      toast.success(
        res?.message ||
        "Variante eliminada correctamente"
      );

      return res;

    } catch (err) {

      const msg =
        err?.response?.data?.message ||
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
  };

};

export const useSearchProductVariant = (delay = 400) => {

  const [query, setQuery] = useState("");

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {

    if (!query.trim()) {

      setResults([]);

      setLoading(false);

      return;

    }

    const timer = setTimeout(async () => {

      try {

        setLoading(true);

        setError(null);

        const res =
          await searchSkuBarcode(query);

        const data =
          res?.data?.data ||
          res?.data ||
          res;

        setResults(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        setError(err);

        setResults([]);

      } finally {

        setLoading(false);

      }

    }, delay);

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