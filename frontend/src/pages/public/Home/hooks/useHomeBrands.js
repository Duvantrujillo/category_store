import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";

export function useHomeBrands() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    apiClient
      .get("/brand/public")
      .then((res) => {
        const data = res?.data?.data || res?.data || [];
        setBrands(Array.isArray(data) ? data : []);
      })
      .catch(() => setBrands([]));
  }, []);

  return { brands };
}
