import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HomeProductCard from "./HomeProductCard";

export default function HomeProductRow({ title, variants, onAddToCart, onToggleFavorite, favoritedIds, cartQtyById }) {
  const scrollRef = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 1);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, variants]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <div className="mb-10">

      {/* Encabezado de categoría */}
      {title && (
        <div className="flex items-center gap-3 mb-4 px-4 sm:px-0">
          <h2 className="text-sm font-bold text-gray-800 tracking-tight whitespace-nowrap">{title}</h2>
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[11px] text-gray-400 font-medium shrink-0 tabular-nums">
            {variants.length}
          </span>
        </div>
      )}

      {/* ── Carrusel ── */}
      <div className="relative">

        {/* Gradiente izquierdo */}
        {canLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 w-16 bg-linear-to-r from-white via-white/60 to-transparent pointer-events-none" />
        )}

        {/* Flecha izquierda — centrada verticalmente */}
        {canLeft && (
          <button
            onClick={() => scroll(-1)}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20
              items-center justify-center
              w-9 h-9
              rounded-full bg-white border border-gray-200 shadow-lg
              text-gray-500 hover:text-rose-500 hover:border-rose-200 hover:shadow-rose-100
              transition-all active:scale-95"
            aria-label="Anterior"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Track de productos */}
        <div
          ref={scrollRef}
          className="flex flex-nowrap gap-3 overflow-x-auto
            px-4 sm:px-0
            pb-1
            [&::-webkit-scrollbar]:hidden
            [-ms-overflow-style:none]
            [scrollbar-width:none]"
        >
          {variants.map((v) => (
            <div
              key={v.id}
              className="w-44 sm:w-52 md:w-56 lg:w-60 shrink-0 self-stretch"
            >
              <HomeProductCard
                variant={v}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                isFavorited={favoritedIds?.has(v.id)}
                cartQty={cartQtyById?.[v.id] ?? 0}
              />
            </div>
          ))}
        </div>

        {/* Gradiente derecho */}
        {canRight && (
          <div className="absolute right-0 top-0 bottom-0 z-10 w-16 bg-linear-to-l from-white via-white/60 to-transparent pointer-events-none" />
        )}

        {/* Flecha derecha — centrada verticalmente */}
        {canRight && (
          <button
            onClick={() => scroll(1)}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20
              items-center justify-center
              w-9 h-9
              rounded-full bg-white border border-gray-200 shadow-lg
              text-gray-500 hover:text-rose-500 hover:border-rose-200 hover:shadow-rose-100
              transition-all active:scale-95"
            aria-label="Siguiente"
          >
            <ChevronRight size={16} />
          </button>
        )}

      </div>
    </div>
  );
}
