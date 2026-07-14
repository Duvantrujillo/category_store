import { Skeleton } from "@/components/ui/skeleton";

// Misma silueta que HomeCartItem — se muestra mientras usePublicCart todavía
// no sabe si el carrito tiene contenido (initializing), para no confundirlo
// con el estado real de "carrito vacío" (HomeCartEmpty).
export default function HomeCartItemSkeleton() {
  return (
    <div className="flex gap-3 py-4 border-b border-gray-100 last:border-0">
      <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
      <div className="flex flex-col gap-2 flex-1 min-w-0 py-0.5">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-3.5 w-4/5" />
        <div className="flex items-center justify-between mt-1.5">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  );
}
