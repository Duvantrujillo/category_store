import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL;

const MAX = 24; // 8 visible columns × 3 rows (enough pages to scroll)

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useRelatedProducts({ currentVariantId, brandId, categoryId }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch(`${API}/product-variant/public`)
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : (data?.data ?? []);
        const others = all.filter((v) => v.id !== currentVariantId);

        const score = (v) =>
          (brandId    && v.product?.brand?.id    === brandId    ? 2 : 0) +
          (categoryId && v.product?.category?.id === categoryId ? 1 : 0);

        const related = others
          .filter((v) => score(v) > 0)
          .sort((a, b) => score(b) - score(a))
          .slice(0, MAX);

        // Fill remaining slots with random products
        if (related.length < MAX) {
          const relatedIds = new Set(related.map((v) => v.id));
          const randoms = shuffle(others.filter((v) => !relatedIds.has(v.id)))
            .slice(0, MAX - related.length);
          setVariants([...related, ...randoms]);
        } else {
          setVariants(related);
        }
      })
      .catch(() => setVariants([]))
      .finally(() => setLoading(false));
  }, [currentVariantId, brandId, categoryId]);

  return { variants, loading };
}
