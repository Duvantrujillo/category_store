import HomeProductCard from "./HomeProductCard";
import HomeProductSkeleton from "./HomeProductSkeleton";
import HomeProductEmpty from "./HomeProductEmpty";

const SKELETONS = Array.from({ length: 8 });

export default function HomeProductGrid({ variants, loading, search, onAddToCart, onToggleFavorite, favoritedIds, cartQtyById }) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-lg font-bold text-rose-900 tracking-tight">
          {search ? `Resultados para "${search}"` : "Nuestros productos"}
        </h2>
        {!loading && variants.length > 0 && (
          <span className="text-xs text-rose-300 font-medium">
            {variants.length} {variants.length === 1 ? "producto" : "productos"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {loading
          ? SKELETONS.map((_, i) => <HomeProductSkeleton key={i} />)
          : variants.length === 0
            ? <HomeProductEmpty search={search} />
            : variants.map((v) => (
                <HomeProductCard
                  key={v.id}
                  variant={v}
                  onAddToCart={onAddToCart}
                  onToggleFavorite={onToggleFavorite}
                  isFavorited={favoritedIds?.has(v.id)}
                  cartQty={cartQtyById?.[v.id] ?? 0}
                />
              ))
        }
      </div>
    </section>
  );
}
