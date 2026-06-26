import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/apiClient";

export function useHomeProducts(search = "", categoryIds = null) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  // Debounce: espera 350 ms tras el último tecleo antes de llamar al backend
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Serializar categoryIds para usarlo como dependencia estable
  const catKey = categoryIds ? categoryIds.join(",") : "";

  const load = useCallback(async (q, catIds) => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (q) params.q = q;
      if (catIds?.length) params.categoryIds = catIds.join(",");
      const res  = await apiClient.get("/product-variant/public", { params });
      const data = res?.data?.data ?? res?.data ?? res;
      setVariants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(debouncedSearch, categoryIds);
    // catKey representa categoryIds de forma estable para la dependencia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, debouncedSearch, catKey]);

  return { variants, loading, error };
}
