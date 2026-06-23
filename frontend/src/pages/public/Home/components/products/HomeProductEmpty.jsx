import { Search } from "lucide-react";

export default function HomeProductEmpty({ search }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-300 mb-4">
        <Search size={28} />
      </div>
      <p className="text-rose-800 font-semibold text-base">
        {search ? `Sin resultados para "${search}"` : "No hay productos disponibles"}
      </p>
      <p className="text-rose-300 text-sm mt-1">
        {search ? "Intenta con otra búsqueda" : "Vuelve pronto, ¡hay novedades en camino!"}
      </p>
    </div>
  );
}
