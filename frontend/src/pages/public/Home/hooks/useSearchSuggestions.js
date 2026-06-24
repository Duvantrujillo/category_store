import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL;
let cachedVariants = null;

export function useSearchSuggestions(query) {
  const [all, setAll]               = useState(cachedVariants ?? []);
  const [suggestions, setSuggestions] = useState([]);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current || cachedVariants) return;
    fetchedRef.current = true;
    fetch(`${API}/product-variant/public`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        cachedVariants = list;
        setAll(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) { setSuggestions([]); return; }

    const results = all
      .filter((v) =>
        v.product?.name?.toLowerCase().includes(q) ||
        v.product?.brand?.name?.toLowerCase().includes(q) ||
        v.product?.category?.name?.toLowerCase().includes(q)
      )
      .slice(0, 6);

    setSuggestions(results);
  }, [query, all]);

  return suggestions;
}
