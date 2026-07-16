import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";

export function useHomeCategories() {
  const [categories, setCategories] = useState([]);
  // true desde el arranque: si empezara en false, el primer render (antes de
  // que corra el efecto de abajo) mostraría "sin categorías" por una
  // fracción de segundo en vez del skeleton.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/category/public")
      .then((res) => {
        const data = res?.data?.data || res?.data || [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
