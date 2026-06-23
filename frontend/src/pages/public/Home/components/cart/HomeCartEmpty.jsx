import { ShoppingBag } from "lucide-react";

export default function HomeCartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16 text-center px-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-300">
        <ShoppingBag size={28} />
      </div>
      <p className="font-semibold text-rose-800 text-sm">Tu carrito está vacío</p>
      <p className="text-rose-300 text-xs leading-relaxed">
        Agrega productos desde la tienda para verlos aquí.
      </p>
    </div>
  );
}
