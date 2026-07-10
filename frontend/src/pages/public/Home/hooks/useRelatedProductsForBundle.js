import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";

// Respaldo para cuando un combo no tiene otros combos relacionados: productos
// afines a los que lo componen (misma marca/categoría), para que la sección
// de "descubre más" en el detalle del combo nunca quede vacía.
export function useRelatedProductsForBundle({ currentBundleId, enabled = true }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!currentBundleId || !enabled) { setLoading(false); return; }

    setLoading(true);
    apiClient
      .get("/bundle/public/related-products", {
        params: { bundleId: currentBundleId, limit: 24 },
      })
      .then((res) => setVariants(res?.data?.data ?? []))
      .catch(() => setVariants([]))
      .finally(() => setLoading(false));
  }, [currentBundleId, enabled]);

  return { variants, loading };
}
