import { ShoppingBag } from "lucide-react";

export default function HomeCartButton({ count = 0, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl text-rose-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
      aria-label="Ver carrito"
    >
      <ShoppingBag size={20} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-400 text-white text-[10px] font-bold leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
