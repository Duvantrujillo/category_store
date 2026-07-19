import { useState, useEffect, useCallback, useRef } from "react";
import apiClient from "@/lib/apiClient";

export function useHomeProducts(search = "", categoryIds = null, filters = {}) {
  const [variants, setVariants] = useState([]);
  // true desde el arranque: si empezara en false, el primer render (antes de
  // que corra el efecto de carga) mostraría "sin productos" por una fracción
  // de segundo en vez del skeleton.
  const [loading, setLoading]         = useState(true);
  // Carga del botón "Ver más" — separada de `loading` para no mostrar el
  // skeleton de página completa cuando solo se está agregando una página más.
  const [loadingMore, setLoadingMore] = useState(false);
  // El backend decide cuántas páginas hay (12 filas × 8 = 96 por página) — el
  // frontend solo refleja lo que la respuesta diga, nunca lo calcula solo.
  const [hasMore, setHasMore]         = useState(false);
  const [error, setError]             = useState(null);
  const pageRef = useRef(1);
  // Se incrementa en cada `load()` (cambio de búsqueda/filtro/orden). Tanto
  // `load` como `loadMore` capturan el id vigente al arrancar y lo comparan
  // antes de aplicar su resultado — así una respuesta que llega tarde de una
  // búsqueda/página ya obsoleta nunca pisa el resultado de la más reciente,
  // ni deja `pageRef` desincronizado con lo que realmente hay en `variants`.
  const requestIdRef = useRef(0);

  // Debounce: espera 350 ms tras el último tecleo antes de llamar al backend
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Serializar categoryIds para usarlo como dependencia estable
  const catKey = categoryIds ? categoryIds.join(",") : "";
  const { minPrice, maxPrice, sortBy } = filters;

  const fetchPage = useCallback(async (q, catIds, priceMin, priceMax, sort, page, append, requestId) => {
    const params = { page };
    if (q) params.q = q;
    if (catIds?.length) params.categoryIds = catIds.join(",");
    if (priceMin !== "" && priceMin != null) params.minPrice = priceMin;
    if (priceMax !== "" && priceMax != null) params.maxPrice = priceMax;
    if (sort) params.sortBy = sort;

    const res = await apiClient.get("/product-variant/public", { params });
    if (requestId !== requestIdRef.current) return; // respuesta obsoleta — se descarta
    const data = Array.isArray(res?.data?.data) ? res.data.data : [];
    setVariants((prev) => (append ? [...prev, ...data] : data));
    setHasMore(!!res?.data?.pagination?.hasMore);
  }, []);

  const load = useCallback(async (q, catIds, priceMin, priceMax, sort) => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);
      pageRef.current = 1;
      await fetchPage(q, catIds, priceMin, priceMax, sort, 1, false, requestId);
    } catch (err) {
      if (requestId === requestIdRef.current) setError(err);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    load(debouncedSearch, categoryIds, minPrice, maxPrice, sortBy);
    // catKey representa categoryIds de forma estable para la dependencia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, debouncedSearch, catKey, minPrice, maxPrice, sortBy]);

  // "Ver más" — pide la siguiente página al backend y la agrega a lo que ya
  // había, sin repetir la petición completa ni recalcular nada en el cliente.
  // Además de `loadingMore`/`hasMore`, se bloquea mientras `loading` esté
  // activo: si no, un clic justo cuando cambia el filtro podía pedir "la
  // página 2" de la búsqueda VIEJA, que `load()` luego pisaba igual, pero
  // dejaba `pageRef` adelantado sin que `variants` realmente tuviera esa
  // página — el siguiente "Ver más" saltaba una página entera para siempre.
  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore) return;
    const requestId = requestIdRef.current;
    try {
      setLoadingMore(true);
      const nextPage = pageRef.current + 1;
      await fetchPage(debouncedSearch, categoryIds, minPrice, maxPrice, sortBy, nextPage, true, requestId);
      if (requestId === requestIdRef.current) pageRef.current = nextPage;
    } catch (err) {
      if (requestId === requestIdRef.current) setError(err);
    } finally {
      if (requestId === requestIdRef.current) setLoadingMore(false);
    }
  }, [fetchPage, loadingMore, loading, hasMore, debouncedSearch, categoryIds, minPrice, maxPrice, sortBy]);

  return { variants, loading, loadingMore, hasMore, error, loadMore };
}
