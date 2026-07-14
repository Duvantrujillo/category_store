import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, Plus } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";
import { getAvailableUnits } from "@/lib/stock";

function getMainImage(images) {
  if (!images?.length) return null;
  const main = images.find((img) => Number(img.slot) === 1);
  return main?.imageUrl ?? images[0]?.imageUrl ?? null;
}

export default function HomeWishlistItem({ variant, onRemove, onAddToCart, onClose }) {
  const navigate = useNavigate();
  const { product, price, attributes, images, finalPrice, promotion } = variant;
  const hasPromotion = !!promotion;
  const outOfStock = getAvailableUnits(variant) === 0;
  const discountPercent = hasPromotion && Number(price) > 0
    ? Math.round((1 - Number(finalPrice) / Number(price)) * 100)
    : 0;

  const rawImg = getMainImage(images);
  const imgSrc = rawImg
    ? `${import.meta.env.VITE_API_URL}${rawImg}`
    : noPhotos;

  function goToProduct() {
    onClose?.();
    navigate(`/producto/${product?.slug ?? variant.id}`);
  }

  return (
    <div
      onClick={goToProduct}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goToProduct(); } }}
      role="button"
      tabIndex={0}
      aria-label={`Ver producto ${product?.name ?? ""}`}
      className="flex gap-3 py-4 border-b border-rose-50 last:border-0 cursor-pointer"
    >

      {/* Imagen */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-rose-50 border border-rose-100 shrink-0">
        <img
          src={imgSrc}
          alt={product?.name}
          className={`w-full h-full object-cover ${outOfStock ? "opacity-60 grayscale" : ""}`}
        />
        {discountPercent > 0 && (
          <span className="absolute top-0.5 right-0.5 text-[8px] font-black px-1 py-0.5 rounded bg-rose-500 text-white shadow-sm leading-none">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">

        {product?.brand?.name && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
            {product.brand.name}
          </span>
        )}

        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product?.name}
        </p>

        {attributes?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {attributes.map((a, i) => (
              <span
                key={i}
                className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-400 border border-rose-100"
              >
                {a.attributeValue?.value}
              </span>
            ))}
          </div>
        )}

        {/* Precio + botón */}
        <div className="flex items-center justify-between mt-1.5">
          {hasPromotion ? (
            <span className="flex flex-col leading-none gap-0.5">
              <span className="text-xs font-medium text-gray-400 line-through decoration-2 opacity-70">
                ${Number(price).toLocaleString("es-CO")}
              </span>
              <span className="text-sm font-bold text-rose-700">
                ${Number(finalPrice).toLocaleString("es-CO")}
              </span>
            </span>
          ) : (
            <span className="text-sm font-bold text-rose-700">
              ${Number(price).toLocaleString("es-CO")}
            </span>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); if (!outOfStock) onAddToCart(variant); }}
            disabled={outOfStock}
            title={outOfStock ? "Agotado" : "Agregar al carrito"}
            className="relative flex items-center justify-center w-8 h-8 rounded-full bg-rose-400 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shadow-sm shadow-rose-200"
          >
            <ShoppingBag size={13} />
            {!outOfStock && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Plus size={8} className="text-rose-500" strokeWidth={3} />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Eliminar */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(variant.id); }}
        className="self-start mt-0.5 flex items-center justify-center w-6 h-6 rounded-lg text-rose-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
        aria-label="Quitar de favoritos"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
