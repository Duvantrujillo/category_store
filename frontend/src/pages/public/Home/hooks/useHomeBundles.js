import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";

export function useHomeBundles() {
  const [bundles, setBundles] = useState([]);

  useEffect(() => {
    apiClient
      .get("/bundle/public")
      .then((res) => {
        const data = res?.data?.data || res?.data || [];
        setBundles(Array.isArray(data) ? data : []);
      })
      .catch(() => setBundles([]));
  }, []);

  return { bundles };
}
