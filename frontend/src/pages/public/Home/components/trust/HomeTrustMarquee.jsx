import { Fragment, useRef, useEffect } from "react";
import { Check, Headset, ShoppingCart, Truck } from "lucide-react";

// Mensajes de confianza en bucle infinito — banda sólida con círculo +
// ícono, como las franjas de "expertos en..." de otras tiendas de belleza,
// pero con los colores rosa/rosé que ya usa el resto del sitio. Cada uno con
// su propio ícono cuando tiene sentido (envíos → camión, compra → carrito);
// el resto usa el check genérico.
const TRUST_ITEMS = [
  { text: "Excelente calidad", icon: Check },
  { text: "Asesoría personalizada", icon: Headset },
  { text: "Compra fácil y segura", icon: ShoppingCart },
  { text: "Envíos a nivel nacional", icon: Truck },
];

function TrustItem({ text, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 px-7 shrink-0">
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white shrink-0">
        <Icon size={15} className="text-rose-500" strokeWidth={3.5} />
      </span>
      <span className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider whitespace-nowrap">
        {text}
      </span>
    </div>
  );
}

// Línea vertical entre cada mensaje — semitransparente para que separe sin
// competir visualmente con el texto.
function TrustSeparator() {
  return <span className="w-px h-5 bg-white/30 shrink-0" aria-hidden="true" />;
}

function renderTrustItems(keyPrefix) {
  return TRUST_ITEMS.map((item) => (
    <Fragment key={`${keyPrefix}-${item.text}`}>
      <TrustItem text={item.text} icon={item.icon} />
      <TrustSeparator />
    </Fragment>
  ));
}

export default function HomeTrustMarquee() {
  const singleRef = useRef(null);
  const trackRef  = useRef(null);
  const rafRef    = useRef(null);
  const posRef    = useRef(0);
  const pausedRef = useRef(false);

  const SPEED = 35; // px por segundo — misma velocidad que el marquee de marcas

  useEffect(() => {
    const single = singleRef.current;
    const track  = trackRef.current;
    if (!single || !track) return;

    const copyWidth = single.scrollWidth;
    if (!copyWidth) return;

    let last = null;

    function step(ts) {
      if (!last) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;

      if (!pausedRef.current) {
        posRef.current -= SPEED * dt;

        if (posRef.current <= -copyWidth) {
          posRef.current += copyWidth;
        }

        track.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section className="mb-0 mt-0">
      <div
        className="relative overflow-hidden bg-linear-to-r from-rose-400 via-rose-500 to-rose-400 py-4 sm:py-5"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        {/* Referencia oculta para medir una sola copia */}
        <div ref={singleRef} className="flex absolute invisible pointer-events-none" aria-hidden="true">
          {renderTrustItems('single')}
        </div>

        {/* Pista animada: varias copias para cubrir cualquier tamaño de pantalla */}
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {[0, 1, 2, 3, 4, 5].map((copy) => renderTrustItems(`copy-${copy}`))}
        </div>
      </div>
    </section>
  );
}
