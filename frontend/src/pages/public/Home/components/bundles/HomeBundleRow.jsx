import { ChevronLeft, ChevronRight } from "lucide-react";
import HomeBundleCard from "./HomeBundleCard";
import { useScrollCarousel } from "../../hooks/useScrollCarousel";

export default function HomeBundleRow({ bundles, onAddToCart, cartQtyById }) {
  const { scrollRef, canLeft, canRight, scrollByItem } = useScrollCarousel([bundles]);

  if (!bundles?.length) return null;

  return (
    <div className="mb-10">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-4 px-4 sm:px-0">
        <h2
          className="text-base sm:text-lg font-black whitespace-nowrap"
          style={{ color: "#4b5563", WebkitTextStroke: "0.6px #4b5563", letterSpacing: "0.08em" }}
        >
          Combos y promociones
        </h2>
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[11px] text-gray-400 font-medium shrink-0 tabular-nums">
          {bundles.length}
        </span>
      </div>

      {/* ── Carrusel ── */}
      <div className="relative">
        {canLeft && (
          <button
            onClick={() => scrollByItem(-1)}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20
              items-center justify-center
              w-9 h-9
              rounded-full bg-white border border-gray-200 shadow-lg
              text-gray-500 hover:text-rose-500 hover:border-rose-200 hover:shadow-rose-100
              transition-all active:scale-95"
            aria-label="Anterior"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex flex-nowrap gap-3 sm:gap-4 overflow-x-auto
            px-4 sm:px-0
            pb-1
            [&::-webkit-scrollbar]:hidden
            [-ms-overflow-style:none]
            [scrollbar-width:none]"
        >
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="shrink-0 self-stretch w-[calc((100%-0.75rem)/2.15)] sm:w-[calc((100%-2rem)/3.15)] md:w-[calc((100%-3rem)/4.15)]"
            >
              <HomeBundleCard
                bundle={bundle}
                onAddToCart={onAddToCart}
                cartQty={cartQtyById?.[bundle.id] ?? 0}
              />
            </div>
          ))}
        </div>

        {canRight && (
          <button
            onClick={() => scrollByItem(1)}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20
              items-center justify-center
              w-9 h-9
              rounded-full bg-white border border-gray-200 shadow-lg
              text-gray-500 hover:text-rose-500 hover:border-rose-200 hover:shadow-rose-100
              transition-all active:scale-95"
            aria-label="Siguiente"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
