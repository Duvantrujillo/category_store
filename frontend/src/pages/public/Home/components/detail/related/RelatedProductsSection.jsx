import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HomeProductCard from "@/pages/public/Home/components/products/HomeProductCard";
import RelatedProductsSkeleton from "./RelatedProductsSkeleton";
import { useRelatedProducts } from "../../../hooks/useRelatedProducts";

const ROWS     = 3;
const PER_ROW  = 8;
const GAP      = 12; // px

function useCols() {
  const get = () => window.innerWidth < 640 ? 2 : window.innerWidth < 768 ? 3 : 4;
  const [cols, setCols] = useState(get);
  useEffect(() => {
    const h = () => setCols(get());
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return cols;
}

// ── One independent scrollable row ──────────────────────────────────────────
function RelatedRow({ variants, cols, onAddToCart, onToggleFavorite, favoritedIds, cartQtyById }) {
  const scrollRef = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [visibleW, setVisibleW] = useState(0);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setVisibleW(el.clientWidth);
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
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
  }, [checkScroll, variants]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (colW + GAP), behavior: "smooth" });
  };

  const colW = visibleW > 0 ? (visibleW - GAP * (cols - 1)) / cols : 200;

  if (!variants.length) return null;

  return (
    <div className="relative">

      {canLeft && (
        <>
          <div className="absolute left-0 top-0 bottom-0 z-10 w-14 bg-linear-to-r from-white via-white/60 to-transparent pointer-events-none" />
          <button
            onClick={() => scroll(-1)}
            className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-20
              items-center justify-center w-9 h-9 rounded-full
              bg-white border border-gray-200 shadow-lg
              text-gray-500 hover:text-rose-500 hover:border-rose-200
              transition-all active:scale-95"
            aria-label="Anterior"
          >
            <ChevronLeft size={16} />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex" style={{ gap: `${GAP}px` }}>
          {variants.map((v) => (
            <div key={v.id} style={{ width: `${colW}px`, flexShrink: 0 }}>
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
      </div>

      {canRight && (
        <>
          <div className="absolute right-0 top-0 bottom-0 z-10 w-14 bg-linear-to-l from-white via-white/60 to-transparent pointer-events-none" />
          <button
            onClick={() => scroll(1)}
            className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-20
              items-center justify-center w-9 h-9 rounded-full
              bg-white border border-gray-200 shadow-lg
              text-gray-500 hover:text-rose-500 hover:border-rose-200
              transition-all active:scale-95"
            aria-label="Siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

    </div>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────
export default function RelatedProductsSection({
  currentVariantId, brandId, brandName, categoryId, categoryName,
  onAddToCart, onToggleFavorite, favoritedIds, cartQtyById,
}) {
  const { variants, loading } = useRelatedProducts({ currentVariantId, brandId, categoryId });
  const cols = useCols();

  if (!loading && variants.length === 0) return null;

  const title = brandName
    ? `Más de ${brandName}`
    : categoryName ? `También de ${categoryName}` : "También te puede gustar";

  // Split products into rows of PER_ROW, max ROWS rows
  const rows = Array.from({ length: ROWS }, (_, i) =>
    variants.slice(i * PER_ROW, (i + 1) * PER_ROW)
  ).filter((r) => r.length > 0);

  const rowProps = { cols, onAddToCart, onToggleFavorite, favoritedIds, cartQtyById };

  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400 shrink-0">
          Descubre más
        </p>
        <div className="flex-1 h-px bg-gray-100" />
        <h2 className="text-sm font-bold text-gray-800 tracking-tight whitespace-nowrap shrink-0">
          {title}
        </h2>
      </div>

      {loading ? (
        <RelatedProductsSkeleton cols={cols} rows={ROWS} gap={GAP} />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row, i) => (
            <RelatedRow key={i} variants={row} {...rowProps} />
          ))}
        </div>
      )}
    </section>
  );
}
