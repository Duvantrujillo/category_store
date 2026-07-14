import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// Filas de relleno para el <TableBody> de cualquier listado admin, mientras
// useAllX({...}) sigue con su fetch inicial — reemplaza el parpadeo de
// "No hay registros" que se veía antes de que llegaran los datos reales.
export default function TableSkeleton({ columns = 5, rows = 6, hasThumbnail = false }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((_, c) => (
            <TableCell key={c} className="px-4 py-3">
              {hasThumbnail && c === 0 ? (
                <div className="flex items-center gap-3 justify-center">
                  <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ) : (
                <Skeleton className="h-3 w-16 mx-auto" />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
