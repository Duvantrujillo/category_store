import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export function usePublicBundle(slug) {
  const [bundle,   setBundle]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setBundle(null);
    fetch(`${API}/bundle/public/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setBundle(data.data ?? data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return { bundle, loading, notFound };
}
