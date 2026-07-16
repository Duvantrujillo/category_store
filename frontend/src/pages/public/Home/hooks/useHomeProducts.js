import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/apiClient";

export function useHomeProducts(search = "", categoryIds = null, filters = {}) {
  const [variants, setVariants] = useState([]);
  // true desde el arranque: si empezara en false, el primer render (antes de
  // que corra el efecto de carga) mostraría "sin productos" por una fracción
  // de segundo en vez del skeleton.
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Debounce: espera 350 ms tras el último tecleo antes de llamar al backend
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Serializar categoryIds para usarlo como dependencia estable
  const catKey = categoryIds ? categoryIds.join(",") : "";
  const { minPrice, maxPrice, sortBy } = filters;

  const load = useCallback(async (q, catIds, priceMin, priceMax, sort) => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (q) params.q = q;
      if (catIds?.length) params.categoryIds = catIds.join(",");
      if (priceMin !== "" && priceMin != null) params.minPrice = priceMin;
      if (priceMax !== "" && priceMax != null) params.maxPrice = priceMax;
      if (sort) params.sortBy = sort;
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
    load(debouncedSearch, categoryIds, minPrice, maxPrice, sortBy);
    // catKey representa categoryIds de forma estable para la dependencia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, debouncedSearch, catKey, minPrice, maxPrice, sortBy]);

  return { variants, loading, error };
}
