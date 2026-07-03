import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";

// Filas curadas ("Más de {marca}", "Explora {categoría}") que arma el backend
// en /product-variant/public/showcase — el frontend solo las renderiza.
// `enabled` evita pedirlas cuando no se van a mostrar (ej. el usuario está
// buscando o filtrando por categoría).
export function useHomeShowcase(enabled = true) {
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    apiClient.get("/product-variant/public/showcase")
      .then((res) => {
        if (cancelled) return;
        const data = res?.data?.data ?? [];
        setGroups(Array.isArray(data) ? data : []);
      })
      .catch(() => { if (!cancelled) setGroups([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [enabled]);

  return { groups, loading };
}
