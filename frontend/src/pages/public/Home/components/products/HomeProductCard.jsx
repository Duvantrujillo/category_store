import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";

function getMainImage(images) {
  if (!images?.length) return null;
  const main = images.find((img) => Number(img.slot) === 1);
  return main?.imageUrl ?? images[0]?.imageUrl ?? null;
}

export default function HomeProductCard({ variant, onAddToCart, onToggleFavorite, isFavorited = false, cartQty = 0, topSellerIds }) {
  const navigate = useNavigate();
  const { product, price, stock, attributes, images } = variant;

  const rawImg     = getMainImage(images);
  const imgSrc     = rawImg ? `${import.meta.env.VITE_API_URL}${rawImg}` : noPhotos;
  const outOfStock  = !stock || Number(stock) === 0;
  const atLimit     = !outOfStock && cartQty >= Number(stock);
  const isTopSeller = topSellerIds?.has(variant.id) ?? false;

  return (
    <article
      onClick={() => navigate(`/producto/${variant.product?.slug ?? variant.id}`)}
      className="group flex flex-col h-full bg-white rounded-2xl cursor-pointer"
    >
      {/* ── Imagen ── */}
      <div className="relative overflow-hidden bg-gray-50 rounded-2xl border border-rose-100" style={{ aspectRatio: "4/5" }}>
        <img
          src={imgSrc}
          alt={product?.name ?? "Producto"}
          className={`h-full w-full object-cover transition-transform duration-500 ${
            outOfStock ? "opacity-60 grayscale-30" : "group-hover:scale-105"
          }`}
        />

        {/* Badge MÁS VENDIDO */}
        {isTopSeller && (
          <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600 shadow-sm tracking-wide uppercase">
            Más vendido ⭐
          </span>
        )}

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
          <p
            className="text-base sm:text-lg font-semibold tracking-wide text-gray-700 leading-none"
            style={{ fontFamily: "system-ui, 'Segoe UI', sans-serif" }}
          >
            ${Number(price).toLocaleString("es-CO")}{" "}
            <span className="text-[10px] sm:text-xs font-normal text-gray-400">COP</span>
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!outOfStock && !atLimit) onAddToCart?.(variant);
            }}
            disabled={outOfStock || atLimit}
            className="w-full h-9 rounded-lg text-xs font-bold tracking-wide uppercase whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-rose-400/80 hover:bg-rose-400/95 active:bg-rose-500 text-white"
          >
            {outOfStock ? "Agotado" : atLimit ? "Límite de stock" : "Agregar al carrito"}
          </button>
        </div>

      </div>
    </article>
  );
}
