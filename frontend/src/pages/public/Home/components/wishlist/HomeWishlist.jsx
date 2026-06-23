import { Heart } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import HomeWishlistItem from "./HomeWishlistItem";
import HomeWishlistEmpty from "./HomeWishlistEmpty";

export default function HomeWishlist({ open, onClose, items, onRemove, onAddToCart }) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-sm flex flex-col p-0 bg-white border-l border-rose-100"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-rose-50">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-rose-900 font-bold text-base">
              <Heart size={18} className="text-rose-400 fill-rose-300" />
              Me encanta
              {items.length > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-500">
                  {items.length} {items.length === 1 ? "producto" : "productos"}
                </span>
              )}
            </SheetTitle>
            <button
              onClick={onClose}
              className="text-rose-300 hover:text-rose-500 transition-colors text-lg leading-none"
              aria-label="Cerrar favoritos"
            >
              ✕
            </button>
          </div>
        </SheetHeader>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <HomeWishlistEmpty />
          ) : (
            items.map((variant) => (
              <HomeWishlistItem
                key={variant.id}
                variant={variant}
                onRemove={onRemove}
                onAddToCart={onAddToCart}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="px-5 pt-4 pb-6 border-t border-rose-50">
            <p className="text-xs text-rose-300 text-center w-full">
              {items.length} {items.length === 1 ? "producto guardado" : "productos guardados"}
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
