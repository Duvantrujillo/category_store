import HomeProductCard from "./HomeProductCard";
import HomeProductRow from "./HomeProductRow";
import HomeProductSkeleton from "./HomeProductSkeleton";
import HomeProductEmpty from "./HomeProductEmpty";

const SKELETONS      = Array.from({ length: 6 });
const CAROUSEL_MIN   = 6;  // a partir de este nro de productos → filas horizontales
const GRID_LIMIT     = 15; // máx productos en grid plano
const ROW_LIMIT      = 14; // máx productos por fila horizontal

function groupByCategory(variants) {
  const map = new Map();
  variants.forEach((v) => {
    const catId   = v.product?.category?.id   ?? 0;
    const catName = v.product?.category?.name ?? "Otros";
    if (!map.has(catId)) map.set(catId, { id: catId, name: catName, variants: [] });
    map.get(catId).variants.push(v);
  });
  // Categorías con más productos primero
  return [...map.values()].sort((a, b) => b.variants.length - a.variants.length);
}

export default function HomeProductGrid({
  variants,
  loading,
  search,
  selectedCategory,
  onAddToCart,
  onToggleFavorite,
  favoritedIds,
  cartQtyById,
}) {
  // Con búsqueda o filtro activo siempre mostramos grid plano
  const isFiltering = !!search || !!selectedCategory;
  const useCarousel = !isFiltering && variants.length >= CAROUSEL_MIN;
  const groups      = useCarousel ? groupByCategory(variants) : [];

  const cardProps = { onAddToCart, onToggleFavorite, favoritedIds, cartQtyById };

  return (
    <section className="mt-2">

      {/* ── Encabezado ── */}
      <div className="flex items-baseline justify-between mb-5 px-4 sm:px-0">
        <h2 className="text-base font-bold text-gray-900 tracking-tight">
          {search
            ? `Resultados para "${search}"`
            : selectedCategory
            ? "Productos de esta categoría"
            : "Nuestros productos"}
        </h2>
        {!loading && variants.length > 0 && (
          <span className="text-xs text-gray-400 font-medium tabular-nums">
            {variants.length} {variants.length === 1 ? "producto" : "productos"}
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

      {/* ── Grid plano: pocos productos o con filtro activo ── */}
      {!loading && variants.length > 0 && !useCarousel && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-0">
          {variants.slice(0, GRID_LIMIT).map((v) => (
            <HomeProductCard
              key={v.id}
              variant={v}
              isFavorited={favoritedIds?.has(v.id)}
              cartQty={cartQtyById?.[v.id] ?? 0}
              {...cardProps}
            />
          ))}
        </div>
      )}

      {/* ── Filas horizontales agrupadas por categoría ── */}
      {!loading && useCarousel && (
        <div>
          {groups.map((group) => (
            <HomeProductRow
              key={group.id}
              title={groups.length > 1 ? group.name : null}
              count={group.variants.length}
              variants={group.variants.slice(0, ROW_LIMIT)}
              {...cardProps}
            />
          ))}
        </div>
      )}

    </section>
  );
}
