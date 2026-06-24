import { useNavigate } from "react-router-dom";
import { Heart, PackageX } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";

function getMainImage(images) {
  if (!images?.length) return null;
  const main = images.find((img) => Number(img.slot) === 1);
  return main?.imageUrl ?? images[0]?.imageUrl ?? null;
}

export default function HomeProductCard({ variant, onAddToCart, onToggleFavorite, isFavorited = false, cartQty = 0 }) {
  const navigate = useNavigate();
  const { product, price, stock, attributes, images, isDefault } = variant;

  const rawImg     = getMainImage(images);
  const imgSrc     = rawImg ? `${import.meta.env.VITE_API_URL}${rawImg}` : noPhotos;
  const outOfStock = !stock || Number(stock) === 0;
  const atLimit    = !outOfStock && cartQty >= Number(stock);

  // Atributos como texto: "Color · Talla · ..."
  const attrText = attributes?.length
    ? attributes.map((a) => a.attributeValue?.value).filter(Boolean).join(" · ")
    : null;

  return (
    <article
      onClick={() => navigate(`/producto/${variant.id}`)}
      className="group flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-md hover:shadow-rose-100 transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100"
    >
      {/* ── Imagen ── */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "4/5" }}>
        <img
          src={imgSrc}
          alt={product?.name ?? "Producto"}
          className={`h-full w-full object-cover transition-transform duration-500 ${
            outOfStock ? "opacity-60 grayscale-30" : "group-hover:scale-105"
          }`}
        />

        {/* Badge MÁS VENDIDO */}
        {isDefault && (
          <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500 text-white shadow-sm tracking-wide uppercase">
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

        {/* Sin stock */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-end justify-center pb-3 bg-rose-900/10">
            <span className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1 rounded-full bg-white/90 text-rose-400 shadow-sm">
              <PackageX size={11} /> Sin stock
            </span>
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="flex flex-col px-2.5 pt-2 pb-2.5 flex-1">

        {/* Parte superior: atributos + nombre */}
        <div className="flex flex-col gap-0.5 flex-1">
          {attrText && (
            <p className="text-[10px] text-gray-400 leading-tight truncate">
              {attrText}
            </p>
          )}
          <h3 className="font-bold text-rose-500 text-xs leading-snug line-clamp-2 min-h-[2.5em]">
            {product?.name ?? "—"}
          </h3>
        </div>

        {/* Parte inferior: precio + botón — siempre al fondo */}
        <div className="mt-2 flex flex-col gap-1.5">
          <p className="text-base font-bold text-gray-800 leading-none">
            ${Number(price).toLocaleString("es-CO")}{" "}
            <span className="text-[10px] font-normal text-gray-400">COP</span>
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!outOfStock && !atLimit) onAddToCart?.(variant);
            }}
            disabled={outOfStock || atLimit}
            className="w-full h-8 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-rose-400/80 hover:bg-rose-400/95 active:bg-rose-500 text-white"
          >
            {outOfStock ? "No disponible" : atLimit ? "Límite de stock" : "Agregar al carrito"}
          </button>
        </div>

      </div>
    </article>
  );
}
