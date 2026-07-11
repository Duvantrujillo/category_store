import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";
import { getAvailableUnits } from "@/lib/stock";

function getMainImage(images) {
  if (!images?.length) return null;
  const main = images.find((img) => Number(img.slot) === 1);
  return main?.imageUrl ?? images[0]?.imageUrl ?? null;
}

export default function HomeProductCard({ variant, onAddToCart, onToggleFavorite, isFavorited = false, cartQty = 0, topSellerIds }) {
  const navigate = useNavigate();
  const { product, price, attributes, images, finalPrice, promotion } = variant;
  const hasPromotion = !!promotion;

  const rawImg     = getMainImage(images);
  const imgSrc     = rawImg ? `${import.meta.env.VITE_API_URL}${rawImg}` : noPhotos;
  const available   = getAvailableUnits(variant);
  const outOfStock  = available === 0;
  const atLimit     = !outOfStock && cartQty >= available;
  const isTopSeller = topSellerIds?.has(variant.id) ?? false;
  const discountPercent = hasPromotion && Number(price) > 0
    ? Math.round((1 - Number(finalPrice) / Number(price)) * 100)
    : 0;

  return (
    <article
      onClick={() => navigate(`/producto/${variant.product?.slug ?? variant.id}`)}
      className="group flex flex-col h-full bg-white rounded-2xl cursor-pointer"
    >
      {/* ── Imagen ── */}
      <div className="relative overflow-hidden bg-gray-50 rounded-2xl border border-rose-100" style={{ aspectRatio: "4/4.4" }}>
        <img
          src={imgSrc}
          alt={product?.name ?? "Producto"}
          className={`h-full w-full object-cover transition-transform duration-500 ${
            outOfStock ? "opacity-60 grayscale-30" : "group-hover:scale-105"
          }`}
        />

        {/* Badges esquina superior derecha */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5">
          {discountPercent > 0 && (
            <span className="text-sm font-black px-3 py-1.5 rounded-lg bg-linear-to-br from-rose-500 to-pink-600 text-white shadow-md ring-2 ring-white/70 tracking-wide">
              -{discountPercent}%
            </span>
          )}
          {isTopSeller && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600 shadow-sm tracking-wide uppercase">
              Más vendido ⭐
            </span>
          )}
        </div>

        {/* Favorito */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(variant); }}
          className={`absolute top-2.5 left-2.5 flex items-center justify-center w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all ${
            isFavorited
              ? "opacity-100 text-rose-500"
              : "opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500"
          }`}
          aria-label={isFavorited ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <Heart size={13} className={isFavorited ? "fill-rose-400" : ""} />
        </button>
      </div>

      {/* ── Info ── */}
      <div className="flex flex-col px-2.5 pt-2 pb-2.5 flex-1">

        {/* Parte superior: nombre */}
        <div className="flex flex-col gap-0.5 flex-1">
          <h3
            className="font-black text-[15px] sm:text-base leading-snug line-clamp-2 min-h-[2.5em]"
            style={{ color: "#e96bb0", WebkitTextStroke: "0.8px #e96bb0", letterSpacing: "0.05em" }}
          >
            {product?.name ?? "—"}
          </h3>
        </div>

        {/* Parte inferior: precio + botón — siempre al fondo */}
        <div className="mt-2 flex flex-col gap-3">
          {hasPromotion ? (
            <div className="flex flex-col leading-none gap-0.5" style={{ fontFamily: "system-ui, 'Segoe UI', sans-serif" }}>
              <span className="text-[13px] font-medium text-gray-400 line-through decoration-2 opacity-70">
                ${Number(price).toLocaleString("es-CO")}
              </span>
              <p className="text-base sm:text-lg font-semibold tracking-wide text-rose-600 leading-none">
                ${Number(finalPrice).toLocaleString("es-CO")}{" "}
                <span className="text-[10px] sm:text-xs font-normal text-gray-400">COP</span>
              </p>
            </div>
          ) : (
            <p
              className="text-base sm:text-lg font-semibold tracking-wide text-gray-700 leading-none"
              style={{ fontFamily: "system-ui, 'Segoe UI', sans-serif" }}
            >
              ${Number(price).toLocaleString("es-CO")}{" "}
              <span className="text-[10px] sm:text-xs font-normal text-gray-400">COP</span>
            </p>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!outOfStock && !atLimit) onAddToCart?.(variant);
            }}
            disabled={outOfStock || atLimit}
            className={`w-full h-9 rounded-lg text-[10px] sm:text-xs font-bold tracking-wide uppercase whitespace-nowrap transition-colors disabled:cursor-not-allowed text-white ${
              outOfStock
                ? "bg-gray-400/90 disabled:opacity-100"
                : "bg-rose-400/80 hover:bg-rose-400/95 active:bg-rose-500 disabled:opacity-50"
            }`}
          >
            {outOfStock ? "Agotado" : "Agregar al carrito"}
          </button>
        </div>

      </div>
    </article>
  );
}
