import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HomeProductCard from "@/pages/public/Home/components/products/HomeProductCard";
import RelatedProductsSkeleton from "./RelatedProductsSkeleton";
import { useRelatedProducts } from "../../../hooks/useRelatedProducts";
import { useScrollCarousel } from "../../../hooks/useScrollCarousel";

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
  const { scrollRef, canLeft, canRight, clientWidth, scroll: scrollBy } = useScrollCarousel([variants]);

  // +0.15 columnas: deja asomar un pedacito de la siguiente tarjeta en el borde
  const colW = clientWidth > 0 ? (clientWidth - GAP * (cols - 1)) / (cols + 0.15) : 200;
  const scroll = (dir) => scrollBy(dir, colW + GAP);

  if (!variants.length) return null;

  return (
    <div className="relative">

      {canLeft && (
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
      )}

      <div
        ref={scrollRef}
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex" style={{ gap: `${GAP}px` }}>
          {variants.map((v, i) => (
            <div key={`${v.id}-${i}`} style={{ width: `${colW}px`, flexShrink: 0 }}>
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
  const rawRows = Array.from({ length: ROWS }, (_, i) =>
    variants.slice(i * PER_ROW, (i + 1) * PER_ROW)
  ).filter((r) => r.length > 0);

  // Si una fila queda "huérfana" (menos productos que PER_ROW), se rellena
  // repitiendo productos ya existentes del mismo pool relacionado — mismo
  // criterio que HomeProductGrid usa en el catálogo principal. Pero acá el
  // pool de relacionados suele ser chico (misma marca/categoría), así que
  // si hay muy pocos productos distintos, rellenar se ve como si el mismo
  // producto se hubiera duplicado varias veces — mejor mostrar la fila corta
  // tal cual que forzar una repetición evidente.
  const MIN_TO_PAD = Math.ceil(PER_ROW / 2);
  const rows = rawRows.map((row) => {
    if (row.length === 0 || row.length >= PER_ROW || variants.length < MIN_TO_PAD) return row;
    const padded = [...row];
    let i = 0;
    while (padded.length < PER_ROW) {
      padded.push(variants[i % variants.length]);
      i++;
    }
    return padded;
  });

  const rowProps = { cols, onAddToCart, onToggleFavorite, favoritedIds, cartQtyById };

  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <p
          className="text-xs sm:text-sm font-black uppercase shrink-0"
          style={{ color: "#4b5563", WebkitTextStroke: "0.6px #4b5563", letterSpacing: "0.1em" }}
        >
          Descubre más
        </p>
        <div className="flex-1 h-px bg-gray-100" />
        <h2
          className="text-base sm:text-lg font-black whitespace-nowrap shrink-0"
          style={{ color: "#4b5563", WebkitTextStroke: "0.6px #4b5563", letterSpacing: "0.08em" }}
        >
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
