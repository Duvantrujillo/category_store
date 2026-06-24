import { ShoppingBag } from "lucide-react";

export default function HomeCartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16 text-center px-6">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 text-gray-300">
        <ShoppingBag size={24} />
      </div>
      <p className="font-semibold text-gray-700 text-sm">Tu carrito está vacío</p>
      <p className="text-gray-400 text-xs leading-relaxed max-w-[180px]">
        Agrega productos desde la tienda para verlos aquí.
      </p>
    </div>
  );
}
