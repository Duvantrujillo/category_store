import { X, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import HomeCartItem from "./HomeCartItem";
import HomeCartEmpty from "./HomeCartEmpty";

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? "";

function buildWhatsAppUrl(items) {
  const lines = items.map(({ variant, quantity }) => {
    const brand    = variant.product?.brand?.name ?? "";
    const name     = variant.product?.name ?? "Producto";
    const attrs    = (variant.attributes ?? [])
      .map((a) => a.attributeValue?.value)
      .filter(Boolean)
      .join(", ");
    const subtotal = (Number(variant.price) * quantity).toLocaleString("es-CO");
    return `• ${brand ? brand + " - " : ""}${name}${attrs ? ` (${attrs})` : ""} × ${quantity} → $${subtotal} COP`;
  });

  const total = items
    .reduce((s, { variant, quantity }) => s + Number(variant.price) * quantity, 0)
    .toLocaleString("es-CO");

  const message = [
    "¡Hola! 👋 Estoy interesad@ en los siguientes productos:",
    "",
    ...lines,
    "",
    `*Total: $${total} COP*`,
    "",
    "¿Están disponibles? 😊",
  ].join("\n");

  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function HomeCart({ open, onClose, items, onRemove, onUpdateQty }) {
  const total      = items.reduce((s, i) => s + Number(i.variant.price) * i.quantity, 0);
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);

  function handleWhatsApp() {
    window.open(buildWhatsAppUrl(items), "_blank", "noopener,noreferrer");
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-sm flex flex-col p-0 bg-white border-l border-gray-100 shadow-2xl"
        showCloseButton={false}
      >
        {/* ── Header ── */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm tracking-tight">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-50">
                <ShoppingBag size={14} className="text-rose-400" />
              </div>
              Mi carrito
              {totalUnits > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {totalUnits} {totalUnits === 1 ? "ítem" : "ítems"}
                </span>
              )}
            </SheetTitle>

            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar carrito"
            >
              <X size={15} />
            </button>
          </div>
        </SheetHeader>

        {/* ── Lista de productos ── */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <HomeCartEmpty />
          ) : (
            items.map((item) => (
              <HomeCartItem
                key={item.variant.id}
                item={item}
                onRemove={onRemove}
                onUpdateQty={onUpdateQty}
              />
            ))
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <SheetFooter className="px-5 pt-4 pb-6 border-t border-gray-100 flex flex-col gap-3">

            {/* Subtotal */}
            <div className="flex items-center justify-between w-full py-1">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-gray-400 font-medium">COP</span>
                <span className="text-xl font-bold text-gray-900 tracking-tight">
                  ${total.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            {/* CTA principal */}
            <button className="w-full h-11 rounded-xl flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-xs font-bold tracking-widest uppercase transition-colors shadow-sm shadow-rose-200">
              <ShoppingBag size={14} />
              Proceder al pago
            </button>

            {/* Divisor */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] text-gray-300 font-medium uppercase tracking-wider">o</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="w-full h-10 rounded-xl flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] active:bg-[#18a852] text-white text-xs font-bold tracking-widest uppercase transition-colors"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Pedir por WhatsApp
            </button>

            <p className="text-center text-[10px] text-gray-300">
              Te enviaremos el detalle del pedido por WhatsApp
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
