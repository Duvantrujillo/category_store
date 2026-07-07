import { ShoppingBag } from "lucide-react";

export default function ProductDetailActions({ variant, outOfStock, atLimit, isFav, onAddToCart, onToggleFavorite }) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => { if (!outOfStock && !atLimit) onAddToCart(variant); }}
        disabled={outOfStock || atLimit}
        className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold tracking-wide transition-all disabled:cursor-not-allowed ${
          outOfStock
            ? "bg-gray-400/90 text-white disabled:opacity-100"
            : "bg-linear-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 active:from-rose-700 active:to-pink-800 disabled:opacity-50 text-white shadow-lg shadow-rose-200/60"
        }`}
      >
        <ShoppingBag size={22} />
        {outOfStock ? "Agotado" : atLimit ? "Límite de stock" : "Agregar al carrito"}
      </button>

      <button
        onClick={() => onToggleFavorite(variant)}
        className={`w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold border-2 transition-all ${
          isFav
            ? "border-rose-300 bg-rose-50 text-rose-600"
            : "border-gray-200 text-gray-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500"
        }`}
      >
        <span className="text-base leading-none">{isFav ? "♥" : "♡"}</span>
        {isFav ? "Guardado en favoritos" : "Guardar en favoritos"}
      </button>
    </div>
  );
}
