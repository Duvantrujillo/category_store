import { Heart } from "lucide-react";

export default function HomeWishlistEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
        <Heart size={28} className="text-rose-200" />
      </div>
      <p className="text-sm font-semibold text-rose-400">Tu lista está vacía</p>
      <p className="text-xs text-rose-300 max-w-[180px]">
        Guarda los productos que te encanten tocando el corazón
      </p>
    </div>
  );
}
