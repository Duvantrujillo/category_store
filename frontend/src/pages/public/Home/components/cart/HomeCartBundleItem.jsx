import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";
import noPhotos from "@/assets/icons/no-fotos.png";
import { getBundleAvailableStock } from "../../hooks/usePublicCart";

function variantLabel(variant) {
  if (!variant) return "";
  const attrs = (variant.attributes ?? [])
    .map((a) => a.attributeValue?.value)
    .filter(Boolean)
    .join(" · ");
  return attrs || variant.sku || "";
}

export default function HomeCartBundleItem({ item, onRemove, onUpdateQty, onClose }) {
  const navigate = useNavigate();
  const { bundle, quantity, selections } = item;
  const available = getBundleAvailableStock(bundle, selections);
  const atLimit = quantity >= available;

  const imgSrc = bundle.mainImage ? `${import.meta.env.VITE_API_URL}${bundle.mainImage}` : noPhotos;
  const subtotal = Number(bundle.price) * quantity;

  const chosenLabels = (bundle.items ?? [])
    .map((recipeItem) => {
      const variant = recipeItem.productVariantId
        ? recipeItem.productVariant
        : recipeItem.product?.variants?.find((v) => v.id === selections?.[recipeItem.id]);
      return variantLabel(variant);
    })
    .filter(Boolean);

  function goToBundle() {
    onClose?.();
    navigate(`/combo/${bundle.slug ?? bundle.id}`);
  }

  return (
    <div
      onClick={goToBundle}
      className="flex gap-3 py-4 border-b border-gray-100 last:border-0 cursor-pointer"
    >

      {/* Imagen */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
        <img
          src={imgSrc}
          alt={bundle.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
          Combo
        </span>

        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
          {bundle.name}
        </p>

        {chosenLabels.length > 0 && (
          <p className="text-[10px] text-gray-400 truncate">{chosenLabels.join(" · ")}</p>
        )}

        {/* Cantidad + precio */}
        <div className="flex items-center justify-between mt-1.5">
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => onUpdateQty(bundle.id, quantity - 1)}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30"
              disabled={quantity <= 1}
            >
              <Minus size={12} />
            </button>
            <span className="text-xs font-semibold text-gray-700 w-7 text-center border-x border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQty(bundle.id, quantity + 1)}
              disabled={atLimit}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={atLimit ? `Máximo disponible: ${available}` : undefined}
            >
              <Plus size={12} />
            </button>
          </div>

          <span className="text-sm font-bold text-gray-900">
            ${subtotal.toLocaleString("es-CO")}
          </span>
        </div>
      </div>

      {/* Eliminar */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(bundle.id); }}
        className="self-start mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
        aria-label="Eliminar del carrito"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
