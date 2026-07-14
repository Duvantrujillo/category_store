import { Skeleton } from "@/components/ui/skeleton";

// Se muestra mientras la consulta de pedido está en curso (loading), en el
// mismo espacio donde luego aparece el resultado real — así no aparece de
// golpe (encabezado, envío, dirección/pago, productos).
export default function TrackOrderResultSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-5">

      {/* Encabezado del pedido */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      {/* Progreso de envío */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col gap-4">
        <Skeleton className="h-3 w-32" />
        <div className="flex items-center justify-between px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-9 h-9 rounded-full" />
          ))}
        </div>
      </div>

      {/* Dirección + Pago */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/5" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      {/* Productos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-50">
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex flex-col divide-y divide-gray-50">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 sm:px-6 py-3.5">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
