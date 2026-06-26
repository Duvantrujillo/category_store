import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";

export function useSearchSuggestions(query) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }

    const t = setTimeout(() => {
      apiClient
        .get("/product-variant/public/suggestions", { params: { q } })
        .then((res) => setSuggestions(res?.data?.data ?? []))
        .catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  return suggestions;
}
