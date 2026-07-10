import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HomeBundleCard from "./HomeBundleCard";
import HomeProductCard from "../products/HomeProductCard";
import RelatedProductsSkeleton from "../detail/related/RelatedProductsSkeleton";
import { useRelatedBundles } from "../../hooks/useRelatedBundles";
import { useRelatedProductsForBundle } from "../../hooks/useRelatedProductsForBundle";
import { useScrollCarousel } from "../../hooks/useScrollCarousel";

const ROWS    = 3;
const PER_ROW = 8;
const GAP     = 12; // px

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

// ── One independent scrollable row (combos) ─────────────────────────────────
function RelatedBundleRow({ bundles, cols, onAddToCart, cartQtyById }) {
  const { scrollRef, canLeft, canRight, clientWidth, scroll: scrollBy } = useScrollCarousel([bundles]);
  const colW = clientWidth > 0 ? (clientWidth - GAP * (cols - 1)) / (cols + 0.15) : 200;
  const scroll = (dir) => scrollBy(dir, colW + GAP);

  if (!bundles.length) return null;

  return (
    <div className="relative">
      {canLeft && (
        <button
          onClick={() => scroll(-1)}
          className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-lg text-gray-500 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95"
          aria-label="Anterior"
        >
          <ChevronLeft size={16} />
        </button>
      )}
      <div ref={scrollRef} className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex" style={{ gap: `${GAP}px` }}>
          {bundles.map((b) => (
            <div key={b.id} style={{ width: `${colW}px`, flexShrink: 0 }}>
              <HomeBundleCard bundle={b} onAddToCart={onAddToCart} cartQty={cartQtyById?.[b.id] ?? 0} />
            </div>
          ))}
        </div>
      </div>
      {canRight && (
        <button
          onClick={() => scroll(1)}
          className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-lg text-gray-500 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95"
          aria-label="Siguiente"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

// ── One independent scrollable row (productos de respaldo) ──────────────────
function RelatedProductRow({ variants, cols, onAddToCart, onToggleFavorite, favoritedIds, cartQtyById }) {
  const { scrollRef, canLeft, canRight, clientWidth, scroll: scrollBy } = useScrollCarousel([variants]);
  const colW = clientWidth > 0 ? (clientWidth - GAP * (cols - 1)) / (cols + 0.15) : 200;
  const scroll = (dir) => scrollBy(dir, colW + GAP);

  if (!variants.length) return null;

  return (
    <div className="relative">
      {canLeft && (
        <button
          onClick={() => scroll(-1)}
          className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-lg text-gray-500 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95"
          aria-label="Anterior"
        >
          <ChevronLeft size={16} />
        </button>
      )}
      <div ref={scrollRef} className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        <button
          onClick={() => scroll(1)}
          className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-lg text-gray-500 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95"
          aria-label="Siguiente"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────
// Muestra otros combos relacionados; si no hay ninguno, cae a productos
// afines a los que componen este combo (misma marca/categoría) para que la
// sección nunca quede vacía.
export default function RelatedBundlesSection({
  currentBundleId,
  onAddBundleToCart, bundleCartQtyById,
  onAddProductToCart, onToggleFavorite, favoritedIds, productCartQtyById,
}) {
  const { bundles, loading: loadingBundles } = useRelatedBundles({ currentBundleId });
  const noBundles = !loadingBundles && bundles.length === 0;

  const { variants, loading: loadingProducts } = useRelatedProductsForBundle({
    currentBundleId,
    enabled: noBundles,
  });

  const cols = useCols();

  const loading  = loadingBundles || (noBundles && loadingProducts);
  const useProducts = noBundles;
  const items    = useProducts ? variants : bundles;

  if (!loading && items.length === 0) return null;

  const rows = Array.from({ length: ROWS }, (_, i) =>
    items.slice(i * PER_ROW, (i + 1) * PER_ROW)
  ).filter((r) => r.length > 0);

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
          {useProducts ? "También te puede gustar" : "Otros combos"}
        </h2>
      </div>

      {loading ? (
        <RelatedProductsSkeleton cols={cols} rows={ROWS} gap={GAP} />
      ) : (
        <div className="flex flex-col gap-3">
          {useProducts
            ? rows.map((row, i) => (
                <RelatedProductRow
                  key={i}
                  variants={row}
                  cols={cols}
                  onAddToCart={onAddProductToCart}
                  onToggleFavorite={onToggleFavorite}
                  favoritedIds={favoritedIds}
                  cartQtyById={productCartQtyById}
                />
              ))
            : rows.map((row, i) => (
                <RelatedBundleRow
                  key={i}
                  bundles={row}
                  cols={cols}
                  onAddToCart={onAddBundleToCart}
                  cartQtyById={bundleCartQtyById}
                />
              ))}
        </div>
      )}
    </section>
  );
}
