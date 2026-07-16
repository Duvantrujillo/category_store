import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";

const FALLBACK_SLIDES = [
  {
    id: "f1",
    type: "fallback",
    tag: "Nueva colección",
    title: "Belleza que te inspira",
    subtitle: "Descubre los labiales, bases y paletas que van a transformar tu look esta temporada.",
    cta: "Ver colección",
    bg: "from-rose-100 via-pink-50 to-fuchsia-100",
    accent: "bg-rose-400",
    dot: "bg-rose-300",
    deco1: "bg-rose-200/60",
    deco2: "bg-pink-200/40",
    deco3: "bg-fuchsia-200/50",
    emoji: "💄",
  },
  {
    id: "f2",
    type: "fallback",
    tag: "Tendencia",
    title: "Glow natural todo el día",
    subtitle: "Iluminadores, correctores y bases de larga duración para una piel radiante sin esfuerzo.",
    cta: "Explorar ahora",
    bg: "from-amber-50 via-rose-50 to-pink-100",
    accent: "bg-pink-400",
    dot: "bg-pink-300",
    deco1: "bg-amber-200/50",
    deco2: "bg-rose-200/40",
    deco3: "bg-pink-200/50",
    emoji: "✨",
  },
  {
    id: "f3",
    type: "fallback",
    tag: "Lo más amado",
    title: "Cuida tu piel, ámate más",
    subtitle: "Rutinas de skincare con productos premium seleccionados especialmente para ti.",
    cta: "Descubrir",
    bg: "from-fuchsia-50 via-rose-50 to-pink-100",
    accent: "bg-fuchsia-400",
    dot: "bg-fuchsia-300",
    deco1: "bg-fuchsia-200/50",
    deco2: "bg-rose-200/40",
    deco3: "bg-pink-200/60",
    emoji: "🌸",
  },
];

const API = import.meta.env.VITE_API_URL;

export default function HomeHeroCarousel() {
  const [slides, setSlides]       = useState(FALLBACK_SLIDES);
  const [current, setCurrent]     = useState(0);
  const [paused, setPaused]       = useState(false);
  const [animating, setAnimating] = useState(false);
  // true hasta que se sepa si hay banners reales — evita el "salto" de
  // mostrar primero el banner genérico y luego reemplazarlo de golpe por
  // uno real (se ve como si por un instante no hubiera nada configurado).
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    apiClient.get("/banner/public")
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data.map((b) => ({ ...b, type: "image" })));
          setCurrent(0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const count = slides.length;

  const goTo = useCallback((index) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 500);
  }, [animating]);

  const prev = () => goTo((current - 1 + count) % count);
  const next = useCallback(() => goTo((current + 1) % count), [current, count, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next]);

  const slide = slides[current];

  if (loading) {
    return (
      <section className="relative overflow-hidden">
        <Skeleton className="w-full min-h-60 sm:min-h-80 md:min-h-[380px] lg:min-h-[440px] rounded-none" />
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── FONDOS ── */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {s.type === "image" ? (
            <>
              <img
                src={`${API}${s.imageUrl}`}
                alt={s.title}
                className="w-full h-full object-cover object-center"
                draggable={false}
              />
              {/* Gradiente: cubre de izquierda (texto) a derecha en desktop, de abajo a arriba en mobile */}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent sm:bg-linear-to-r sm:from-black/60 sm:via-black/30 sm:to-transparent" />
            </>
          ) : (
            <div className={`absolute inset-0 bg-linear-to-br ${s.bg}`} />
          )}
        </div>
      ))}

      {/* Decorativos solo en fallback y solo en pantallas medianas+ */}
      {slide.type === "fallback" && (
        <>
          <div className={`hidden sm:block absolute -top-10 -right-10 w-64 h-64 rounded-full blur-3xl ${slide.deco1} transition-all duration-700`} />
          <div className={`hidden sm:block absolute bottom-0 -left-8 w-48 h-48 rounded-full blur-2xl ${slide.deco2} transition-all duration-700`} />
          <div className={`hidden sm:block absolute top-1/2 right-1/4 w-32 h-32 rounded-full blur-2xl ${slide.deco3} transition-all duration-700`} />
        </>
      )}

      {/* ── CONTENIDO ── */}
      <div className="relative z-10 flex items-end sm:items-center min-h-60 sm:min-h-80 md:min-h-[380px] lg:min-h-[440px] px-5 sm:px-12 lg:px-16 pb-10 pt-8 sm:py-12">
        <div
          key={current}
          className="flex flex-col gap-2.5 sm:gap-4 w-full sm:max-w-lg"
          style={{ animation: "fadeSlideUp 0.5s ease forwards" }}
        >
          {slide.type === "fallback" ? (
            <>
              {/* Tag */}
              <span className={`self-start flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full ${slide.accent} text-white shadow-sm`}>
                <Sparkles size={9} />
                {slide.tag}
              </span>

              {/* Título */}
              <h1
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-rose-900 leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}
              >
                {slide.title}
              </h1>

              {/* Subtítulo — oculto en mobile muy pequeño */}
              <p className="hidden xs:block sm:block text-xs sm:text-base text-gray-700/70 leading-relaxed max-w-xs sm:max-w-sm">
                {slide.subtitle}
              </p>

              {/* CTA */}
              <button
                className="self-start mt-1 sm:mt-2 flex items-center gap-2 h-9 sm:h-11 px-5 sm:px-6 rounded-full bg-white/85 hover:bg-white/95 backdrop-blur-sm active:scale-95 text-gray-700 text-xs sm:text-sm tracking-widest transition-all border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.15),0_1px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_28px_rgba(0,0,0,0.2),0_2px_6px_rgba(0,0,0,0.1)]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 600 }}
              >
                {slide.cta}
                <ChevronRight size={14} />
              </button>

              {/* Emoji — solo en pantallas ≥ sm para que no tape el texto */}
              <div className="hidden sm:block absolute right-10 lg:right-16 top-1/2 -translate-y-1/2 text-8xl lg:text-9xl select-none opacity-40 pointer-events-none">
                {slide.emoji}
              </div>
            </>
          ) : (
            <>
              {/* Título del banner de imagen */}
              {slide.title && (
                <h1
                  className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg max-w-[260px] sm:max-w-lg"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}
                >
                  {slide.title}
                </h1>
              )}

              {/* Botón CTA si hay link */}
              {slide.link && (
                <a
                  href={slide.link}
                  className="self-start mt-1 sm:mt-2 flex items-center gap-2 h-9 sm:h-11 px-5 sm:px-6 rounded-full bg-white/85 hover:bg-white/95 backdrop-blur-sm active:scale-95 text-gray-700 text-xs sm:text-sm tracking-widest transition-all border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.15),0_1px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_28px_rgba(0,0,0,0.2),0_2px_6px_rgba(0,0,0,0.1)]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 600 }}
                >
                  Ver más
                  <ChevronRight size={14} />
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── FLECHAS — solo visibles cuando hay más de 1 slide ── */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-9 h-9 rounded-full bg-white/75 backdrop-blur-sm text-rose-500 hover:bg-white hover:scale-110 transition-all shadow-sm border border-white/60"
            aria-label="Anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={next}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-9 h-9 rounded-full bg-white/75 backdrop-blur-sm text-rose-500 hover:bg-white hover:scale-110 transition-all shadow-sm border border-white/60"
            aria-label="Siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* ── DOTS — solo cuando hay más de 1 slide ── */}
      {count > 1 && <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            aria-label={`Ir a slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? s.type === "image"
                  ? "w-5 h-1.5 sm:w-6 sm:h-2 bg-white"
                  : `w-5 h-1.5 sm:w-6 sm:h-2 ${s.dot}`
                : "w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>}
    </section>
  );
}
