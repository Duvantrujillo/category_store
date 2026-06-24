import HomeProductRow from "@/pages/public/Home/components/products/HomeProductRow";
import RelatedProductsSkeleton from "./RelatedProductsSkeleton";
import { useRelatedProducts } from "../../hooks/useRelatedProducts";

export default function RelatedProductsSection({
  currentVariantId,
  brandId,
  brandName,
  categoryId,
  categoryName,
  onAddToCart,
  onToggleFavorite,
  favoritedIds,
  cartQtyById,
}) {
  const { variants, loading } = useRelatedProducts({ currentVariantId, brandId, categoryId });

  if (!loading && variants.length === 0) return null;

  const title = brandName
    ? `Más de ${brandName}`
    : categoryName
      ? `También de ${categoryName}`
      : "También te puede gustar";

  return (
    <section>
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400 mb-1">
          Descubre más
        </p>
      </div>

      {loading ? (
        <RelatedProductsSkeleton />
      ) : (
        <HomeProductRow
          title={title}
          variants={variants}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
          favoritedIds={favoritedIds}
          cartQtyById={cartQtyById}
        />
      )}
    </section>
  );
}
