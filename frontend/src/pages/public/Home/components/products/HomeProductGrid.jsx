import HomeProductCard from "./HomeProductCard";
import HomeProductSkeleton from "./HomeProductSkeleton";
import HomeProductEmpty from "./HomeProductEmpty";

const SKELETONS = Array.from({ length: 12 });
const PAGE_SIZE = 12;

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
  const firstGroup = variants.slice(0, PAGE_SIZE);
  const restGroups = [];
  for (let i = PAGE_SIZE; i < variants.length; i += PAGE_SIZE) {
    restGroups.push(variants.slice(i, i + PAGE_SIZE));
  }

  const cardProps = { onAddToCart, onToggleFavorite, favoritedIds, cartQtyById, topSellerIds };

  const renderCard = (v) => (
    <HomeProductCard
      key={v.id}
      variant={v}
      isFavorited={favoritedIds?.has(v.id)}
      cartQty={cartQtyById?.[v.id] ?? 0}
      {...cardProps}
    />
  );

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

      {/* ── Skeleton ── */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-0">
          {SKELETONS.map((_, i) => <HomeProductSkeleton key={i} />)}
        </div>
      )}

      {/* ── Sin resultados ── */}
      {!loading && variants.length === 0 && (
        <HomeProductEmpty search={search} />
      )}

      {!loading && variants.length > 0 && (
        <>
          {/* ── Primeros 12: grid (2 cols mobile, 3 tablet, 4 desktop) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-0">
            {firstGroup.map(renderCard)}
          </div>

          {/* ── Resto: filas horizontales con scroll (round-robin visual) ── */}
          {restGroups.map((group, idx) => (
            <div
              key={idx}
              className="flex gap-3 sm:gap-4 overflow-x-auto mt-6 pb-2 px-4 sm:px-0 scroll-smooth"
            >
              {group.map((v) => (
                <div key={v.id} className="shrink-0 w-[46vw] sm:w-52 md:w-56">
                  {renderCard(v)}
                </div>
              ))}
            </div>
          ))}
        </>
      )}

    </section>
  );
}
