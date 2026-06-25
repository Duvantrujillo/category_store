import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";

export function useTopSellers() {
  const [topSellerIds, setTopSellerIds] = useState(new Set());

  useEffect(() => {
    apiClient
      .get("/product-variant/public/top-sellers")
      .then((res) => {
        const ids = res?.data?.data ?? [];
        setTopSellerIds(new Set(ids));
      })
      .catch(() => {});
  }, []);

  return { topSellerIds };
}
