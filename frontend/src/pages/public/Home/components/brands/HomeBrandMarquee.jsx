import { useRef, useEffect } from "react";
import noPhotos from "@/assets/icons/no-fotos.png";

function BrandItem({ brand }) {
  const logoSrc = brand.logoUrl
    ? `${import.meta.env.VITE_API_URL}${brand.logoUrl}`
    : null;

  return (
    <div className="flex items-center gap-3 px-4 shrink-0">
      <span className="text-purple-300 text-[10px] select-none">◆</span>
      <div className="flex items-center gap-3">
        {logoSrc && (
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-purple-100 shadow-sm flex items-center justify-center shrink-0">
            <img
              src={logoSrc}
              alt={brand.name}
              className="w-full h-full object-contain p-0.5"
              onError={(e) => { e.currentTarget.src = noPhotos; }}
            />
          </div>
        )}
        <span className="text-sm font-bold text-gray-700 whitespace-nowrap tracking-wide">
          {brand.name}
        </span>
      </div>
    </div>
  );
}

export default function HomeBrandMarquee({ brands }) {
  const singleRef  = useRef(null);
  const trackRef   = useRef(null);
  const rafRef     = useRef(null);
  const posRef     = useRef(0);
  const pausedRef  = useRef(false);

  const SPEED = 35; // px por segundo

  useEffect(() => {
    if (!brands.length) return;
    const single = singleRef.current;
    const track  = trackRef.current;
    if (!single || !track) return;

    // Ancho de una sola copia
    const copyWidth = single.scrollWidth;
    if (!copyWidth) return;

    let last = null;

    function step(ts) {
      if (!last) last = ts;
      const dt = (ts - last) / 1000; // segundos
      last = ts;

      if (!pausedRef.current) {
        posRef.current -= SPEED * dt;

        // Resetear invisiblemente cuando se completó una copia
        if (posRef.current <= -copyWidth) {
          posRef.current += copyWidth; // salta W px hacia la derecha — invisible porque la siguiente copia es idéntica
        }

        track.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [brands]);

  if (!brands.length) return null;

  return (
    <section className="mb-0 mt-0">
      <div
        className="relative overflow-hidden bg-purple-50/70 border-y border-purple-100 py-4"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        {/* Fade izquierdo */}
        <div
          className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #faf5ff 0%, transparent 100%)" }}
        />
        {/* Fade derecho */}
        <div
          className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #faf5ff 0%, transparent 100%)" }}
        />

        {/* Pista: referencia oculta para medir una sola copia */}
        <div ref={singleRef} className="flex absolute invisible pointer-events-none" aria-hidden="true">
          {brands.map((b) => <BrandItem key={b.id} brand={b} />)}
        </div>

        {/* Pista animada: suficientes copias para cubrir pantalla × 3 */}
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {/* 6 copias garantizan cobertura en cualquier tamaño de pantalla */}
          {[0, 1, 2, 3, 4, 5].map((copy) =>
            brands.map((b) => <BrandItem key={`${copy}-${b.id}`} brand={b} />)
          )}
        </div>
      </div>
    </section>
  );
}
