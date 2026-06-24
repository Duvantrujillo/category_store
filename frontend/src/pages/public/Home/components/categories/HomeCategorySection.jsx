import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HomeCategoryCard from "./HomeCategoryCard";

function SkeletonCard() {
  return (
    <div className="shrink-0 flex flex-col items-center gap-2.5 w-48">
      <div className="w-48 h-64 rounded-2xl bg-rose-100 animate-pulse" />
      <div className="w-24 h-3 rounded-full bg-rose-100 animate-pulse" />
    </div>
  );
}

export default function HomeCategorySection({ categories, loading, selected, onSelect }) {
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
          className="text-8xl font-black"
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
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Botón "Todos" */}
          <button
            onClick={() => onSelect(null)}
            className="group shrink-0 flex flex-col items-center gap-2.5 focus:outline-none w-48"
          >
            <div
              className={`w-48 h-64 rounded-2xl flex items-center justify-center transition-all duration-300 text-4xl
                ${selected === null
                  ? "bg-rose-400 ring-2 ring-rose-400 ring-offset-2 shadow-lg shadow-rose-200/60"
                  : "bg-rose-50 border border-rose-100 hover:border-rose-200 shadow-sm hover:shadow-md"
                }`}
            >
              ✨
            </div>
            <span
              className={`text-xs font-semibold transition-colors duration-200
                ${selected === null ? "text-rose-500" : "text-rose-900 group-hover:text-rose-500"}`}
            >
              Todos
            </span>
          </button>

          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : categories.map((cat) => (
                <HomeCategoryCard
                  key={cat.id}
                  category={cat}
                  selected={selected === cat.id}
                  onClick={() => onSelect(selected === cat.id ? null : cat.id)}
                />
              ))
          }
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
