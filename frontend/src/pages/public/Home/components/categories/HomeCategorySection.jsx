import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import HomeCategoryCard from "./HomeCategoryCard";

function SkeletonCard() {
  return (
    <div className="shrink-0 flex flex-col items-center gap-2.5 w-48">
      <div className="w-48 h-64 rounded-2xl bg-rose-100 animate-pulse" />
      <div className="w-24 h-3 rounded-full bg-rose-100 animate-pulse" />
    </div>
  );
}

export default function HomeCategorySection({ categories, loading, selected, onSelect, selectedParent, onBack }) {
  const scrollRef = useRef(null);
  const [showLeft,  setShowLeft]  = useState(false);
  const [showRight, setShowRight] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 1);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Medir después de que el DOM pinte el contenido
    const raf = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [categories, loading, update]);

  function scroll(dir) {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  }

  if (!loading && categories.length === 0) return null;

  const arrowBase =
    "hidden sm:flex absolute top-1/2 -translate-y-1/2 z-10 items-center justify-center w-9 h-9 rounded-full bg-white border border-rose-200 text-rose-400 shadow-md hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition-all duration-200";

  return (
    <section className="mb-10 mt-1">
      {/* Título centrado */}
      <div className="flex justify-center mb-5">
        <h2
          className="text-4xl sm:text-6xl lg:text-8xl font-black"
          style={{ color: "#4b5563", WebkitTextStroke: "1.5px #4b5563", letterSpacing: "0.1em" }}
        >
          Categorías
        </h2>
      </div>

      {/* Carrusel con flechas dinámicas */}
      <div className="relative">

        {/* Flecha izquierda — solo cuando hay contenido a la izquierda */}
        <button
          onClick={() => scroll(-1)}
          aria-label="Anterior"
          className={`${arrowBase} left-0 -translate-x-1/2 ${showLeft ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto py-2 px-1 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {selectedParent ? (
            /* ── Vista hijos: botón volver + "Todos" del padre ── */
            <>
              {/* Botón volver */}
              <button
                onClick={onBack}
                className="group shrink-0 flex flex-col items-center gap-2.5 focus:outline-none w-48"
              >
                <div className="w-48 h-64 rounded-2xl flex flex-col items-center justify-center gap-3 bg-gray-50 border border-gray-200 hover:border-rose-200 hover:bg-rose-50 shadow-sm hover:shadow-md transition-all duration-300">
                  <ArrowLeft size={28} className="text-gray-400 group-hover:text-rose-400 transition-colors duration-200" />
                  <span className="text-xs text-gray-400 group-hover:text-rose-400 font-semibold transition-colors duration-200 text-center leading-tight px-2">
                    {selectedParent.name}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-400 group-hover:text-rose-400 transition-colors duration-200">
                  Volver
                </span>
              </button>

              {/* Todos los productos del padre */}
              <button
                onClick={() => onSelect(null)}
                className="group shrink-0 focus:outline-none w-48"
              >
                <div className={`relative w-48 h-64 rounded-2xl overflow-hidden transition-all duration-300
                  ${selected === null
                    ? "ring-2 ring-rose-400 ring-offset-2 shadow-lg shadow-rose-200/60"
                    : "shadow-sm hover:shadow-lg hover:shadow-rose-200/50"
                  }`}
                >
                  <div className="absolute inset-0 bg-linear-to-b from-rose-200 to-rose-400" />
                  <div className="absolute inset-0 flex items-center justify-center pb-8 text-5xl">✨</div>
                  <div className="absolute inset-0 bg-linear-to-t from-rose-600/50 via-transparent to-transparent" />
                  {selected === null && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-300 shadow-sm" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 px-3 pb-3.5 flex flex-col items-center">
                    <span
                      className="text-white text-sm font-semibold text-center leading-tight tracking-wide drop-shadow-sm"
                      style={{ fontFamily: "system-ui, 'Segoe UI', sans-serif" }}
                    >
                      Todos
                    </span>
                    <span className="block h-[1.5px] bg-white mt-1.5 rounded-full transition-all duration-300 origin-center w-0 group-hover:w-full opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              </button>

              {/* Hijos */}
              {categories.map((cat) => (
                <HomeCategoryCard
                  key={cat.id}
                  category={cat}
                  selected={selected === cat.id}
                  onClick={() => onSelect(cat.id)}
                />
              ))}
            </>
          ) : (
            /* ── Vista padres ── */
            <>
              <button
                onClick={() => onSelect(null)}
                className="group shrink-0 focus:outline-none w-48"
              >
                <div className={`relative w-48 h-64 rounded-2xl overflow-hidden transition-all duration-300
                  ${selected === null
                    ? "ring-2 ring-rose-400 ring-offset-2 shadow-lg shadow-rose-200/60"
                    : "shadow-sm hover:shadow-lg hover:shadow-rose-200/50"
                  }`}
                >
                  <div className="absolute inset-0 bg-linear-to-b from-rose-200 to-rose-400" />
                  <div className="absolute inset-0 flex items-center justify-center pb-8 text-5xl">✨</div>
                  <div className="absolute inset-0 bg-linear-to-t from-rose-600/50 via-transparent to-transparent" />
                  {selected === null && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-300 shadow-sm" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 px-3 pb-3.5 flex flex-col items-center">
                    <span
                      className="text-white text-sm font-semibold text-center leading-tight tracking-wide drop-shadow-sm"
                      style={{ fontFamily: "system-ui, 'Segoe UI', sans-serif" }}
                    >
                      Todos
                    </span>
                    <span className="block h-[1.5px] bg-white mt-1.5 rounded-full transition-all duration-300 origin-center w-0 group-hover:w-full opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              </button>

              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                : categories.map((cat) => (
                    <HomeCategoryCard
                      key={cat.id}
                      category={cat}
                      selected={selected === cat.id}
                      onClick={() => onSelect(cat.id)}
                    />
                  ))
              }
            </>
          )}
        </div>

        {/* Flecha derecha — solo cuando hay contenido a la derecha */}
        <button
          onClick={() => scroll(1)}
          aria-label="Siguiente"
          className={`${arrowBase} right-0 translate-x-1/2 ${showRight ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
