import { Skeleton } from "@/components/ui/skeleton";

// Misma grilla de 2 columnas que el contenido real de ProductDetail (galería
// + título/marca/atributos/precio/botón), para que no haya salto de layout
// cuando usePublicProduct termina de cargar.
export default function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-16 items-start">

      <Skeleton className="h-[380px] sm:h-[460px] md:h-[520px] lg:h-[620px] rounded-2xl" />

      <div className="flex flex-col gap-7">
        <Skeleton className="h-9 w-4/5" />

        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-3/5" />
        </div>

        <Skeleton className="h-4 w-24" />

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>

        <Skeleton className="h-10 w-40" />

        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

    </div>
  );
}
