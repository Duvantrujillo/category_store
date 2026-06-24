import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL;

export function useRelatedProducts({ currentVariantId, brandId, categoryId }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!brandId && !categoryId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`${API}/product-variant/public`)
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : (data?.data ?? []);

        const related = all
          .filter((v) => v.id !== currentVariantId)
          .filter((v) => {
            const sameBrand = brandId    && v.product?.brand?.id    === brandId;
            const sameCat   = categoryId && v.product?.category?.id === categoryId;
            return sameBrand || sameCat;
          })
          // Brand matches first, then category-only matches
          .sort((a, b) => {
            const score = (v) =>
              (brandId    && v.product?.brand?.id    === brandId    ? 2 : 0) +
              (categoryId && v.product?.category?.id === categoryId ? 1 : 0);
            return score(b) - score(a);
          })
          .slice(0, 8);

        setVariants(related);
      })
      .catch(() => setVariants([]))
      .finally(() => setLoading(false));
  }, [currentVariantId, brandId, categoryId]);

  return { variants, loading };
}
