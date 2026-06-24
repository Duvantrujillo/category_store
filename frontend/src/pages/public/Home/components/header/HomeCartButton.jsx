import { ShoppingBag } from "lucide-react";

export default function HomeCartButton({ count = 0, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl text-white hover:bg-white/20 transition-colors"
      aria-label="Ver carrito"
    >
      <ShoppingBag size={20} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white text-rose-500 text-[10px] font-bold leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
