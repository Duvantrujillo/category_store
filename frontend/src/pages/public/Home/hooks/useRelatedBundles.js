import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";

export function useRelatedBundles({ currentBundleId }) {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentBundleId) { setLoading(false); return; }

    setLoading(true);
    apiClient
      .get("/bundle/public/related", {
        params: { bundleId: currentBundleId, limit: 24 },
      })
      .then((res) => setBundles(res?.data?.data ?? []))
      .catch(() => setBundles([]))
      .finally(() => setLoading(false));
  }, [currentBundleId]);

  return { bundles, loading };
}
