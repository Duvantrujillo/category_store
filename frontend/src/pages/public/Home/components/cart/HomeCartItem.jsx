import { Trash2, Plus, Minus } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";

function getMainImage(images) {
  if (!images?.length) return null;
  const main = images.find((img) => Number(img.slot) === 1);
  return main?.imageUrl ?? images[0]?.imageUrl ?? null;
}

export default function HomeCartItem({ item, onRemove, onUpdateQty }) {
  const { variant, quantity } = item;
  const { product, price, attributes, images, stock } = variant;
  const atLimit = quantity >= Number(stock ?? 0);

  const rawImg = getMainImage(images);
  const imgSrc = rawImg
    ? `${import.meta.env.VITE_API_URL}${rawImg}`
    : noPhotos;

  const subtotal = Number(price) * quantity;

  return (
    <div className="flex gap-3 py-3.5 border-b border-rose-50 last:border-0">

      {/* Imagen */}
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-rose-50 shrink-0">
        <img
          src={imgSrc}
          alt={product?.name}
          className="w-full h-full object-cover"
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

        {/* Atributos */}
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

        {/* Cantidad + precio */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateQty(variant.id, quantity - 1)}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100 transition-colors disabled:opacity-40"
              disabled={quantity <= 1}
            >
              <Minus size={11} />
            </button>
            <span className="text-xs font-semibold text-rose-800 w-5 text-center">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQty(variant.id, quantity + 1)}
              disabled={atLimit}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={atLimit ? `Máximo disponible: ${stock}` : undefined}
            >
              <Plus size={11} />
            </button>
          </div>

          <span className="text-sm font-bold text-rose-700">
            ${subtotal.toLocaleString("es-CO")}
          </span>
        </div>
      </div>

      {/* Eliminar */}
      <button
        onClick={() => onRemove(variant.id)}
        className="self-start mt-0.5 flex items-center justify-center w-7 h-7 rounded-full text-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
        aria-label="Eliminar del carrito"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
