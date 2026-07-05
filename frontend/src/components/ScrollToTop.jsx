import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  // `key` cambia en cada navegación, incluso si es a la misma ruta (ej. dar
  // clic de nuevo en un link del footer estando ya en esa página), a
  // diferencia de `pathname`, que no cambia en ese caso.
  const { key } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [key]);

  return null;
}
