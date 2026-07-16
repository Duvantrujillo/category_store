import { useState } from "react";
import { useNavigate } from "react-router-dom";
import noPhotos from "@/assets/icons/no-fotos.png";
import { getBundleAvailableStock } from "../../hooks/usePublicCart";
import BundleVariantSelectorModal from "./BundleVariantSelectorModal";

export default function HomeBundleCard({ bundle, onAddToCart, cartQty = 0 }) {
  const navigate = useNavigate();
  const [showSelector, setShowSelector] = useState(false);
  const imgSrc = bundle.mainImage ? `${import.meta.env.VITE_API_URL}${bundle.mainImage}` : noPhotos;

  const hasFreeSlots = bundle.items?.some((item) => !item.productVariantId) ?? false;
  const available = getBundleAvailableStock(bundle);
  const outOfStock = available <= 0;
  const atLimit = !outOfStock && cartQty >= available;
  const itemsCount = bundle.items?.length ?? 0;

  function handleAddClick(e) {
    e.stopPropagation();
    if (outOfStock || atLimit) return;
    if (hasFreeSlots) {
      setShowSelector(true);
    } else {
      onAddToCart?.(bundle, {});
    }
  }

  return (
    <article
      onClick={() => navigate(`/combo/${bundle.slug ?? bundle.id}`)}
      className="group flex flex-col h-full bg-white rounded-2xl cursor-pointer"
    >
      {/* ── Imagen ── */}
      <div className="relative overflow-hidden bg-gray-50 rounded-2xl border border-rose-100" style={{ aspectRatio: "4/4.4" }}>
        <img
          src={imgSrc}
          alt={bundle.name}
          className={`h-full w-full object-cover transition-transform duration-500 ${
            outOfStock ? "opacity-60 grayscale-30" : "group-hover:scale-105"
          }`}
        />
        <span className="absolute top-2.5 left-2.5 text-[11px] sm:text-xs font-black px-3 py-1.5 rounded-lg bg-linear-to-br from-rose-500 to-pink-600 text-white shadow-md ring-2 ring-white/70 tracking-wide uppercase">
          Combo · {itemsCount} prod.
        </span>
      </div>

      {/* ── Info ── */}
      <div className="flex flex-col px-2.5 pt-2 pb-2.5 flex-1">
        <div className="flex flex-col gap-0.5 flex-1">
          <h3
            className="font-black text-[15px] sm:text-base leading-snug line-clamp-2 min-h-[2.5em]"
            style={{ color: "#e96bb0", WebkitTextStroke: "0.8px #e96bb0", letterSpacing: "0.05em" }}
          >
            {bundle.name}
          </h3>
        </div>

        <div className="mt-2 flex flex-col gap-3">
          <p
            className="text-base sm:text-lg font-semibold tracking-wide text-gray-700 leading-none"
            style={{ fontFamily: "system-ui, 'Segoe UI', sans-serif" }}
          >
            ${Number(bundle.price).toLocaleString("es-CO")}{" "}
            <span className="text-[10px] sm:text-xs font-normal text-gray-400">COP</span>
          </p>

          <button
            onClick={handleAddClick}
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

      {showSelector && (
        <BundleVariantSelectorModal
          bundle={bundle}
          onClose={() => setShowSelector(false)}
          onConfirm={(selections) => onAddToCart?.(bundle, selections)}
        />
      )}
    </article>
  );
}
