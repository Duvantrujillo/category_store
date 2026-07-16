import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export function usePublicProduct(slug) {
  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  // Distinto de `notFound`: un 404 real (el producto no existe) no es lo
  // mismo que una falla de red/servidor — mostrarlos igual confunde al
  // usuario ("no encontrado" cuando en realidad el backend se cayó).
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    setLoading(true);
    setNotFound(false);
    setError(null);
    setProduct(null);
    fetch(`${API}/product/public/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => { if (data) setProduct(data); })
      .catch(() => setError("No pudimos cargar este producto. Intenta de nuevo en unos minutos."))
      .finally(() => setLoading(false));
  }, [slug]);

  return { product, loading, notFound, error };
}
