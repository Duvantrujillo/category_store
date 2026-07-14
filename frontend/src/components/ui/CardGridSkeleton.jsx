import { Skeleton } from "@/components/ui/skeleton";

// Grid de tarjetas de relleno para los módulos admin que se listan como
// cards (categoría, marca, producto, etc.) en vez de tabla — mismo objetivo
// que TableSkeleton, pero calzando el layout de grid en vez de filas.
export default function CardGridSkeleton({
  count = 10,
  hasImage = true,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-5",
}) {
  return (
    <div className={gridClassName}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
          {hasImage && <Skeleton className="w-full aspect-square rounded-none" />}
          <div className="p-3 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
