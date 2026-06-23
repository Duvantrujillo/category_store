import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    tag: "Nueva colección",
    title: "Belleza que\nte inspira",
    subtitle: "Descubre los labiales, bases y paletas que van a transformar tu look este temporada.",
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
    id: 2,
    tag: "Tendencia",
    title: "Glow natural\ntodo el día",
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
    id: 3,
    tag: "Lo más amado",
    title: "Cuida tu piel,\námate más",
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

export default function HomeHeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((index) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 500);
  }, [animating]);

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative mb-0 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 bg-linear-to-br ${s.bg} transition-opacity duration-700 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
      ))}

      {/* Decorativos */}
      <div className={`absolute -top-10 -right-10 w-64 h-64 rounded-full blur-3xl ${slide.deco1} transition-all duration-700`} />
      <div className={`absolute bottom-0 -left-8 w-48 h-48 rounded-full blur-2xl ${slide.deco2} transition-all duration-700`} />
      <div className={`absolute top-1/2 right-1/4 w-32 h-32 rounded-full blur-2xl ${slide.deco3} transition-all duration-700`} />

      {/* Contenido */}
      <div className="relative z-10 min-h-[340px] sm:min-h-[400px] flex items-center px-8 sm:px-14 py-12">
        <div
          key={current}
          className="flex flex-col gap-4 max-w-lg animate-[fadeSlideUp_0.55s_ease_forwards]"
          style={{ animation: "fadeSlideUp 0.55s ease forwards" }}
        >
          {/* Tag */}
          <span className={`self-start flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${slide.accent} text-white shadow-sm`}>
            <Sparkles size={10} />
            {slide.tag}
          </span>

          {/* Título */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-rose-900 leading-tight whitespace-pre-line tracking-tight">
            {slide.title}
          </h1>

          {/* Subtítulo */}
          <p className="text-sm sm:text-base text-rose-700/70 leading-relaxed max-w-sm">
            {slide.subtitle}
          </p>

          {/* CTA */}
          <button className={`self-start mt-2 flex items-center gap-2 h-11 px-6 rounded-full ${slide.accent} hover:opacity-90 active:scale-95 text-white text-sm font-semibold tracking-wide transition-all shadow-md`}>
            {slide.cta}
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Emoji decorativo grande */}
        <div className="absolute right-10 sm:right-16 top-1/2 -translate-y-1/2 text-7xl sm:text-9xl select-none opacity-30 sm:opacity-50 pointer-events-none">
          {slide.emoji}
        </div>
      </div>

      {/* Flecha izquierda */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm text-rose-500 hover:bg-white hover:scale-110 transition-all shadow-sm border border-rose-100"
        aria-label="Anterior"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Flecha derecha */}
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm text-rose-500 hover:bg-white hover:scale-110 transition-all shadow-sm border border-rose-100"
        aria-label="Siguiente"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            aria-label={`Ir a slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? `w-6 h-2 ${s.dot}`
                : "w-2 h-2 bg-rose-200 hover:bg-rose-300"
            }`}
          />
        ))}
      </div>

    </section>
  );
}
