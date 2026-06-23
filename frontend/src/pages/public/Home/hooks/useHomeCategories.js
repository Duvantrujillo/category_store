import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";

export function useHomeCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
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
