import { Skeleton } from "@/components/ui/skeleton";
import HomeProductSkeleton from "./HomeProductSkeleton";

// Fila skeleton compartida por HomeBundleRow y HomeProductRow (showcase) —
// mismo layout de encabezado + carrusel horizontal que el contenido real,
// para que no aparezcan de golpe una vez que sus datos llegan.
export default function HomeCarouselRowSkeleton() {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4 px-4 sm:px-0">
        <Skeleton className="h-5 w-40" />
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <div className="flex flex-nowrap gap-3 sm:gap-4 overflow-hidden px-4 sm:px-0 pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 self-stretch w-[calc((100%-0.75rem)/2.15)] sm:w-[calc((100%-2rem)/3.15)] md:w-[calc((100%-3rem)/4.15)]"
          >
            <HomeProductSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
