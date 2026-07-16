import { useState, useEffect, useRef } from "react";
import { Gift, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import noPhotos from "@/assets/icons/no-fotos.png";
import { getVariantImage } from "@/lib/media";

// El ícono tarda esto en encogerse/desvanecerse antes de revelar el
// contenido — debe coincidir con la duration-500 de la clase de abajo.
const OPEN_ANIM_MS = 500;

// Interacción tipo "abrir el regalo": el ícono de regalo rebota hasta que lo
// tocan; TODO el ícono es un único <button>, así el área de clic nunca queda
// ambigua. Al tocarlo, el ícono se encoge y se desvanece, y solo entonces se
// revela qué producto/variante le tocó — nombre + imagen principal de la
// variante (con fallback a la del producto vía getVariantImage). Responsive:
// mismo Dialog centrado en desktop y móvil, el contenido se adapta con sm:.
export default function GiftRevealModal({ open, onClose, gift }) {
  const [opening, setOpening]   = useState(false);
  const [revealed, setRevealed] = useState(false);
  const openTimeoutRef = useRef(null);

  // Reinicia todo cada vez que el diálogo se cierra, para que la próxima vez
  // que se abra vuelva a mostrar la cajita cerrada rebotando — y cancela el
  // timeout de apertura si seguía pendiente (si no, revelaba el contenido
  // igual más tarde aunque el modal ya estuviera cerrado).
  useEffect(() => {
    if (!open) {
      clearTimeout(openTimeoutRef.current);
      setOpening(false);
      setRevealed(false);
    }
  }, [open]);

  // Por si el componente se desmonta con el timeout todavía pendiente.
  useEffect(() => () => clearTimeout(openTimeoutRef.current), []);

  if (!gift) return null;

  const variant = gift.productVariant;
  const productName = variant?.product?.name ?? gift.name;
  const rawImg = getVariantImage(variant);
  const imgSrc = rawImg ? `${import.meta.env.VITE_API_URL}${rawImg}` : noPhotos;

  function handleOpen() {
    if (opening) return;
    setOpening(true);
    openTimeoutRef.current = setTimeout(() => setRevealed(true), OPEN_ANIM_MS);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-sm w-[90vw] p-0 overflow-hidden rounded-3xl border-rose-100"
        showCloseButton={false}
      >
        <div className="relative flex flex-col items-center justify-center gap-4 px-6 py-10 sm:py-12 bg-linear-to-b from-rose-50 via-pink-50 to-white text-center min-h-[280px] sm:min-h-[320px]">

          <DialogTitle className="sr-only">Tu regalo por monto de compra</DialogTitle>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-white/70 transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>

          {!revealed ? (
            <>
              <button
                type="button"
                onClick={handleOpen}
                disabled={opening}
                aria-label="Abrir regalo"
                className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-linear-to-br from-rose-400 to-pink-500 text-white shadow-xl ring-4 ring-white/70 active:scale-95 transition-transform ${
                  opening ? "" : "animate-bounce"
                }`}
              >
                <Gift
                  size={40}
                  className={`sm:hidden transition-all duration-500 ease-out ${opening ? "scale-125 opacity-0" : ""}`}
                />
                <Gift
                  size={48}
                  className={`hidden sm:block transition-all duration-500 ease-out ${opening ? "scale-125 opacity-0" : ""}`}
                />
              </button>

              <p className="text-sm font-semibold text-gray-600 max-w-56">
                ¡Toca el regalo para ver qué te llevas gratis!
              </p>
            </>
          ) : (
            <>
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white shrink-0" style={{ animation: "fadeSlideUp 0.35s ease forwards" }}>
                <img src={imgSrc} alt={productName} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-rose-400">¡Tu regalo!</p>
                <p className="text-base sm:text-lg font-bold text-gray-800 mt-1 leading-snug">{productName}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
