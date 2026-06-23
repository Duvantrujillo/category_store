import { Trash2, ShoppingBag } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";

function getMainImage(images) {
  if (!images?.length) return null;
  const main = images.find((img) => Number(img.slot) === 1);
  return main?.imageUrl ?? images[0]?.imageUrl ?? null;
}

export default function HomeWishlistItem({ variant, onRemove, onAddToCart }) {
  const { product, price, attributes, images, stock } = variant;
  const outOfStock = !stock || Number(stock) === 0;

  const rawImg = getMainImage(images);
  const imgSrc = rawImg
    ? `${import.meta.env.VITE_API_URL}${rawImg}`
    : noPhotos;

  return (
    <div className="flex gap-3 py-3.5 border-b border-rose-50 last:border-0">

      {/* Imagen */}
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-rose-50 shrink-0">
        <img
          src={imgSrc}
          alt={product?.name}
          className={`w-full h-full object-cover ${outOfStock ? "opacity-60 grayscale" : ""}`}
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">

        {product?.brand?.name && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-pink-400">
            {product.brand.name}
          </span>
        )}

        <p className="text-xs font-semibold text-rose-900 line-clamp-2 leading-snug">
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

        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-bold text-rose-700">
            ${Number(price).toLocaleString("es-CO")}
          </span>

          <button
            onClick={() => !outOfStock && onAddToCart(variant)}
            disabled={outOfStock}
            className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-rose-400 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            <ShoppingBag size={10} />
            {outOfStock ? "Sin stock" : "Al carrito"}
          </button>
        </div>
      </div>

      {/* Eliminar */}
      <button
        onClick={() => onRemove(variant.id)}
        className="self-start mt-0.5 flex items-center justify-center w-7 h-7 rounded-full text-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
        aria-label="Quitar de favoritos"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
