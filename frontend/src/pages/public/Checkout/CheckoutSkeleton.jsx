import { Skeleton } from "@/components/ui/skeleton";

// Se muestra mientras usePublicCart todavía no resuelve su primer fetch
// (cartInitializing) — evita que el checkout muestre "Tu carrito está
// vacío" o un formulario en blanco antes de saber si el carrito tiene
// contenido real. Misma grilla 2 columnas que el contenido real.
export default function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

      {/* Formulario */}
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 sm:p-6 flex flex-col gap-4">
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 sm:p-6 flex flex-col gap-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>

      {/* Resumen */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex flex-col divide-y divide-gray-50">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3 px-5 py-4">
              <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
              <div className="flex-1 flex flex-col gap-2 py-1">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>

    </div>
  );
}
