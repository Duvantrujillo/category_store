import { useState } from "react";
import { Gift } from "lucide-react";
import GiftRevealModal from "./GiftRevealModal";

// Vista previa del regalo por monto de compra (viene de cart-public.controller.js:
// enrichCart → cart.gift, recalculada por el backend en cada cambio del
// carrito). Solo informativa: el regalo real se agrega al confirmar la
// orden, no aquí. `progressPercent` ya llega calculado desde el backend —
// acá solo se pinta como ancho de barra, nunca se recalcula en el cliente.
// Se usa tanto en el drawer del carrito (HomeCart) como en el resumen del
// checkout, para que el progreso sea visible en todo el flujo antes de pagar.
export default function CartGiftBanner({ gift, className = "" }) {
  const [revealOpen, setRevealOpen] = useState(false);

  if (!gift || gift.progressPercent == null) return null;

  const done = gift.qualifies;
  const percent = Math.max(0, Math.min(100, gift.progressPercent));

  return (
    <>
    <div
      onClick={() => done && setRevealOpen(true)}
      className={`rounded-xl border px-3.5 py-3 transition-colors ${
        done ? "bg-emerald-50 border-emerald-100 cursor-pointer hover:bg-emerald-100/70" : "bg-rose-50 border-rose-100"
      } ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${done ? "bg-emerald-100" : "bg-rose-100"}`}>
          <Gift size={15} className={done ? "text-emerald-600" : "text-rose-400"} />
        </div>
        <p className={`text-xs leading-snug ${done ? "text-emerald-700" : "text-rose-600"}`}>
          {done ? (
            <>
              <span className="font-bold">¡Llevas gratis {gift.current.name}!</span>{" "}
              Se agregará automáticamente al confirmar tu pedido.{" "}
              <span className="underline underline-offset-2">Toca para verlo</span>.
            </>
          ) : (
            <>
              Te faltan <span className="font-bold">${Number(gift.next.remaining).toLocaleString("es-CO")}</span> para llevar gratis{" "}
              <span className="font-bold">{gift.next.name}</span>.
            </>
          )}
        </p>
      </div>

      {/* Barra de progreso — el ancho es el porcentaje que ya calculó el
          backend (nunca un cálculo propio del cliente); la transición la
          hace sentir "en vivo" cada vez que cambia el carrito. */}
      <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/70 overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${
            done ? "bg-emerald-500" : "bg-rose-400"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>

    {done && (
      <GiftRevealModal
        open={revealOpen}
        onClose={() => setRevealOpen(false)}
        gift={gift.current}
      />
    )}
    </>
  );
}
