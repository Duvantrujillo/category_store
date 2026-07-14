import { Skeleton } from "@/components/ui/skeleton";

// Misma grilla de 2 columnas que el contenido real de BundleDetail (galería
// + tag/título/descripción/precio/lista de ítems/botón), para que no haya
// salto de layout cuando usePublicBundle termina de cargar.
export default function BundleDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-16 items-start">

      <Skeleton className="h-[380px] sm:h-[460px] md:h-[520px] lg:h-[620px] rounded-2xl" />

      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-4/5" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/5" />
        </div>

        <Skeleton className="h-8 w-32" />

        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-40" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>

        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

    </div>
  );
}
