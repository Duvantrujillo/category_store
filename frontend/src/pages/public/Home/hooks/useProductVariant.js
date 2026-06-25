import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export function useProductVariant(id) {
  const [variant,  setVariant]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    fetch(`${API}/product-variant/public/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setVariant(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  return { variant, loading, notFound };
}
