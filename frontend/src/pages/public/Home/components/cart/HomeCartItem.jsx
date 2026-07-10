import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";
import { getAvailableUnits } from "@/lib/stock";

function getMainImage(images) {
  if (!images?.length) return null;
  const main = images.find((img) => Number(img.slot) === 1);
  return main?.imageUrl ?? images[0]?.imageUrl ?? null;
}

export default function HomeCartItem({ item, onRemove, onUpdateQty, onClose }) {
  const navigate = useNavigate();
  const { variant, quantity } = item;
  const { product, price, attributes, images, finalPrice, promotion } = variant;
  const hasPromotion = !!promotion;
  const available = getAvailableUnits(variant);
  const atLimit = quantity >= available;

  const rawImg = getMainImage(images);
  const imgSrc = rawImg
    ? `${import.meta.env.VITE_API_URL}${rawImg}`
    : noPhotos;

  const subtotal = Number(hasPromotion ? finalPrice : price) * quantity;
  const originalSubtotal = Number(price) * quantity;

  function goToProduct() {
    onClose?.();
    navigate(`/producto/${product?.slug ?? variant.id}`);
  }

  return (
    <div
      onClick={goToProduct}
      className="flex gap-3 py-4 border-b border-gray-100 last:border-0 cursor-pointer"
    >

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
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => onUpdateQty(variant.id, quantity - 1)}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30"
              disabled={quantity <= 1}
            >
              <Minus size={12} />
            </button>
            <span className="text-xs font-semibold text-gray-700 w-7 text-center border-x border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQty(variant.id, quantity + 1)}
              disabled={atLimit}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={atLimit ? `Máximo disponible: ${available}` : undefined}
            >
              <Plus size={12} />
            </button>
          </div>

          {hasPromotion ? (
            <span className="flex flex-col items-end leading-none">
              <span className="text-[10px] text-gray-400 line-through opacity-70">
                ${originalSubtotal.toLocaleString("es-CO")}
              </span>
              <span className="text-sm font-bold text-rose-600 mt-0.5">
                ${subtotal.toLocaleString("es-CO")}
              </span>
            </span>
          ) : (
            <span className="text-sm font-bold text-gray-900">
              ${subtotal.toLocaleString("es-CO")}
            </span>
          )}
        </div>
      </div>

      {/* Eliminar */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(variant.id); }}
        className="self-start mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
        aria-label="Eliminar del carrito"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
