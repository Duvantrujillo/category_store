import { PackageX } from "lucide-react";

export default function ProductDetailPrice({ price, stock, outOfStock }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-1.5">
            Precio
          </p>
          <p className="text-5xl font-black text-rose-600 leading-none tracking-tight">
            ${Number(price).toLocaleString("es-CO")}
          </p>
          <p className="mt-1.5 text-xs text-gray-400 font-medium">Impuestos incluidos</p>
        </div>

        <div className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full shrink-0 ${
          outOfStock
            ? "bg-red-50 text-red-400 border border-red-100"
            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
        }`}>
          {outOfStock ? (
            <><PackageX size={13} />Sin stock</>
          ) : (
            <><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />{stock} disponibles</>
          )}
        </div>
      </div>
    </div>
  );
}
