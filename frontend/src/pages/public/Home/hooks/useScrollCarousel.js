import { useRef, useState, useEffect, useCallback } from "react";

// Curva suave (ease-in-out cúbica): arranca y frena de a poco, en vez del
// scroll nativo del navegador que suele sentirse brusco.
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const SCROLL_DURATION_MS = 550;

// Detección de scroll horizontal compartida por los carruseles del home
// (HomeProductRow, RelatedProductsSection, HomeCategorySection): expone si
// se puede desplazar a cada lado y una función `scroll(dir, amount?)` para
// las flechas. `deps` son las dependencias extra que deben re-medir el
// carrusel (ej. cuando cambian los items renderizados).
export function useScrollCarousel(deps = []) {
  const scrollRef = useRef(null);
  const animationIdRef = useRef(0);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [clientWidth, setClientWidth] = useState(0);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setClientWidth(el.clientWidth);
    setCanLeft(el.scrollLeft > 1);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Medir después de que el DOM pinte el contenido
    const raf = requestAnimationFrame(checkScroll);
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkScroll, ...deps]);

  const scroll = useCallback((dir, amount) => {
    const el = scrollRef.current;
    if (!el) return;

    const distance = dir * (amount ?? el.clientWidth);
    const start    = el.scrollLeft;
    const startTime = performance.now();
    const thisAnimationId = ++animationIdRef.current;

    function step(now) {
      // Si se disparó otro scroll mientras tanto, esta animación se descarta
      if (animationIdRef.current !== thisAnimationId) return;
      const progress = Math.min((now - startTime) / SCROLL_DURATION_MS, 1);
      el.scrollLeft = start + distance * easeInOutCubic(progress);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, []);

  // Avanza un solo elemento (mide el ancho real + separación entre las
  // primeras dos tarjetas del track), en vez de saltar una pantalla entera.
  const scrollByItem = useCallback((dir) => {
    const el = scrollRef.current;
    if (!el || el.children.length === 0) return;

    const first = el.children[0].getBoundingClientRect();
    let step = first.width;
    if (el.children.length > 1) {
      const second = el.children[1].getBoundingClientRect();
      step = second.left - first.left; // ancho de la tarjeta + separación
    }
    scroll(dir, step);
  }, [scroll]);

  return { scrollRef, canLeft, canRight, clientWidth, scroll, scrollByItem };
}
