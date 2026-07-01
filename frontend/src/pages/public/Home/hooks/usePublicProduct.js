import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export function usePublicProduct(slug) {
  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setProduct(null);
    fetch(`${API}/product/public/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setProduct(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return { product, loading, notFound };
}
