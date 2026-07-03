import HomeProductRow from "./HomeProductRow";
import HomeProductSkeleton from "./HomeProductSkeleton";
import HomeProductEmpty from "./HomeProductEmpty";

const PAGE_SIZE = 8;
const SKELETON_ROWS = 2;
const SKELETON_CARDS_PER_ROW = 4;
const SKELETON_CARD_CLS = "shrink-0 w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)]";

export default function HomeProductGrid({
  variants,
  loading,
  search,
  selectedCategory,
  onAddToCart,
  onToggleFavorite,
  favoritedIds,
  cartQtyById,
  topSellerIds,
}) {
  // Bloques de hasta 12 productos; cada uno se muestra como un carrusel
  // horizontal (4 visibles en pantalla + flechas para navegar el resto).
  const groups = [];
  for (let i = 0; i < variants.length; i += PAGE_SIZE) {
    groups.push(variants.slice(i, i + PAGE_SIZE));
  }

  return (
    <section className="mt-2">

      {/* ── Encabezado ── */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-5 px-4 sm:px-0">
        <h2
          className="text-3xl sm:text-5xl lg:text-7xl font-black"
          style={{ color: "#4b5563", WebkitTextStroke: "1.5px #4b5563", letterSpacing: "0.1em" }}
        >
          {search
            ? `Resultados para "${search}"`
            : selectedCategory
            ? "Productos de esta categoría"
            : "Nuestros productos"}
        </h2>
        {!loading && variants.length > 0 && (
          <span className="text-xs text-gray-400 font-medium tabular-nums">
            <span className="sm:hidden">{variants.length} prod.</span>
            <span className="hidden sm:inline">{variants.length} {variants.length === 1 ? "producto" : "productos"}</span>
          </span>
        )}
      </div>

      {/* ── Skeleton: mismo layout de fila/carrusel que el contenido real ── */}
      {loading && (
        <div className="flex flex-col gap-6">
          {Array.from({ length: SKELETON_ROWS }).map((_, row) => (
            <div key={row} className="flex gap-3 sm:gap-4 overflow-hidden px-4 sm:px-0">
              {Array.from({ length: SKELETON_CARDS_PER_ROW }).map((_, i) => (
                <div key={i} className={SKELETON_CARD_CLS}>
                  <HomeProductSkeleton />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Sin resultados ── */}
      {!loading && variants.length === 0 && (
        <HomeProductEmpty search={search} />
      )}

      {/* ── Cada bloque de hasta 12: carrusel horizontal (4 visibles + flechas) ── */}
      {!loading && variants.length > 0 && groups.map((group, idx) => (
        <HomeProductRow
          key={idx}
          variants={group}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
          favoritedIds={favoritedIds}
          cartQtyById={cartQtyById}
          topSellerIds={topSellerIds}
        />
      ))}

    </section>
  );
}
