import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";

export function useHomeBundles() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/bundle/public")
      .then((res) => {
        const data = res?.data?.data || res?.data || [];
        setBundles(Array.isArray(data) ? data : []);
      })
      .catch(() => setBundles([]))
      .finally(() => setLoading(false));
  }, []);

  return { bundles, loading };
}
