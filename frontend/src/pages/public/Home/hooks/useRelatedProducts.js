import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";

export function useRelatedProducts({ currentVariantId }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!currentVariantId) { setLoading(false); return; }

    setLoading(true);
    apiClient
      .get("/product-variant/public/related", {
        params: { variantId: currentVariantId, limit: 24 },
      })
      .then((res) => setVariants(res?.data?.data ?? []))
      .catch(() => setVariants([]))
      .finally(() => setLoading(false));
  }, [currentVariantId]);

  return { variants, loading };
}
