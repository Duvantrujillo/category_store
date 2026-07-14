import { useEffect } from "react";

const SITE_NAME = "WowBeauty";

// Cambia el <title> de la pestaña por página, sin depender de react-helmet.
// Restaura el título anterior al desmontar, para no "ensuciar" otra vista
// si el cambio de ruta no vuelve a llamar este hook a tiempo.
export function usePageTitle(title) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
