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
    <div className="flex gap-3 py-4 border-b border-gray-100 last:border-0">

      {/* Imagen */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
        <img
          src={imgSrc}
          alt={product?.name}
          className="w-full h-full object-cover"
        />
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
                className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500"
              >
                {a.attributeValue?.value}
              </span>
            ))}
          </div>
        )}

        {/* Cantidad + precio */}
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onUpdateQty(variant.id, quantity - 1)}
              className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30"
              disabled={quantity <= 1}
            >
              <Minus size={10} />
            </button>
            <span className="text-xs font-semibold text-gray-700 w-6 text-center border-x border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQty(variant.id, quantity + 1)}
              disabled={atLimit}
              className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={atLimit ? `Máximo disponible: ${stock}` : undefined}
            >
              <Plus size={10} />
            </button>
          </div>

          <span className="text-sm font-bold text-gray-900">
            ${subtotal.toLocaleString("es-CO")}
          </span>
        </div>
      </div>

      {/* Eliminar */}
      <button
        onClick={() => onRemove(variant.id)}
        className="self-start mt-0.5 flex items-center justify-center w-6 h-6 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
        aria-label="Eliminar del carrito"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
