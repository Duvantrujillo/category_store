import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/apiClient";

async function fetchAllVariants() {
  const res = await apiClient.get("/product-variant/public");
  const data = res?.data?.data || res?.data || res;
  return Array.isArray(data) ? data : [];
}

export function useHomeProducts(search = "", categoryId = null) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllVariants();
      setVariants(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const q = search.toLowerCase().trim();

  const filtered = variants.filter((v) => {
    const matchesCategory = categoryId
      ? v.product?.category?.id === categoryId
      : true;

    const matchesSearch = q
      ? v.product?.name?.toLowerCase().includes(q) ||
        v.product?.brand?.name?.toLowerCase().includes(q) ||
        v.product?.category?.name?.toLowerCase().includes(q) ||
        v.sku?.toLowerCase().includes(q) ||
        v.attributes?.some((a) =>
          a.attributeValue?.value?.toLowerCase().includes(q)
        )
      : true;

    return matchesCategory && matchesSearch;
  });

  return { variants: filtered, loading, error };
}
