import { Heart, X } from "lucide-react";
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
        className="w-full sm:max-w-sm flex flex-col p-0 bg-white border-l border-gray-100 shadow-2xl"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm tracking-tight">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-50">
                <Heart size={14} className="text-rose-400 fill-rose-300" />
              </div>
              Me encanta
              {items.length > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {items.length} {items.length === 1 ? "producto" : "productos"}
                </span>
              )}
            </SheetTitle>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar favoritos"
            >
              <X size={15} />
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
          <SheetFooter className="px-5 pt-4 pb-6 border-t border-gray-100">
            <p className="text-center text-[10px] text-gray-300 w-full">
              {items.length} {items.length === 1 ? "producto guardado" : "productos guardados"}
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
