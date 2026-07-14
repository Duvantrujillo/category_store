import { useState } from "react";
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

const SORT_OPTIONS = [
  { value: "",           label: "Relevancia" },
  { value: "price_asc",  label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "newest",     label: "Más recientes" },
];

const inputCls =
  "w-full h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:bg-white focus:border-rose-300 transition-colors";

function PriceFields({ minPrice, maxPrice, onChange, layout = "row" }) {
  return (
    <div className={layout === "row" ? "flex items-center gap-1.5" : "grid grid-cols-2 gap-3"}>
      <div className={layout === "row" ? "" : "flex flex-col gap-1"}>
        {layout === "grid" && (
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Mínimo</label>
        )}
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={minPrice}
          onChange={(e) => onChange({ minPrice: e.target.value })}
          placeholder="Precio mín."
          aria-label="Precio mínimo"
          className={layout === "row"
            ? "w-28 h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-700 outline-none focus:border-rose-300 transition-colors"
            : inputCls}
        />
      </div>
      {layout === "row" && <span className="text-gray-300 text-xs">—</span>}
      <div className={layout === "row" ? "" : "flex flex-col gap-1"}>
        {layout === "grid" && (
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Máximo</label>
        )}
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={maxPrice}
          onChange={(e) => onChange({ maxPrice: e.target.value })}
          placeholder="Precio máx."
          aria-label="Precio máximo"
          className={layout === "row"
            ? "w-28 h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-700 outline-none focus:border-rose-300 transition-colors"
            : inputCls}
        />
      </div>
    </div>
  );
}

export default function HomeProductFilters({ minPrice, maxPrice, sortBy, onChange }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeCount = [minPrice, maxPrice, sortBy].filter(Boolean).length;
  const hasActiveFilter = activeCount > 0;
  const clearAll = () => onChange({ minPrice: "", maxPrice: "", sortBy: "" });

  return (
    <div className="mb-4 px-4 sm:px-0">

      {/* ── Desktop / tablet: fila inline (sin cambios de comportamiento) ── */}
      <div className="hidden sm:flex flex-wrap items-center gap-2.5">
        <PriceFields minPrice={minPrice} maxPrice={maxPrice} onChange={onChange} layout="row" />

        <select
          value={sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value })}
          aria-label="Ordenar por"
          className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-700 outline-none focus:border-rose-300 transition-colors cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-rose-400 hover:text-rose-500 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Móvil: botón que abre un panel inferior con los filtros ── */}
      <div className="sm:hidden flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="relative flex items-center gap-2 h-10 pl-3.5 pr-4 rounded-xl border border-gray-200 bg-white shadow-sm active:scale-[0.98] transition-transform"
        >
          <SlidersHorizontal size={14} className="text-rose-400" />
          <span className="text-xs font-semibold text-gray-700">Filtros</span>
          {hasActiveFilter && (
            <span className="flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none">
              {activeCount}
            </span>
          )}
        </button>

        {sortBy && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
            <ArrowUpDown size={11} className="shrink-0" />
            {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
          </span>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-gray-100 p-0 max-h-[85vh]"
          showCloseButton={false}
        >
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-gray-100 flex-row items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-gray-900 text-sm font-semibold">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-50">
                <SlidersHorizontal size={13} className="text-rose-400" />
              </div>
              Filtrar productos
            </SheetTitle>
            <button
              onClick={() => setSheetOpen(false)}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar filtros"
            >
              <X size={15} />
            </button>
          </SheetHeader>

          <div className="px-5 py-5 flex flex-col gap-5 overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Rango de precio
              </label>
              <PriceFields minPrice={minPrice} maxPrice={maxPrice} onChange={onChange} layout="grid" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Ordenar por
              </label>
              <div className="flex flex-col gap-2">
                {SORT_OPTIONS.map((opt) => {
                  const active = sortBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChange({ sortBy: opt.value })}
                      className={`flex items-center justify-between h-11 rounded-xl border px-3.5 text-sm transition-colors ${
                        active
                          ? "border-rose-300 bg-rose-50 text-rose-600 font-semibold"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    >
                      {opt.label}
                      {active && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <SheetFooter className="px-5 pb-5 pt-3 border-t border-gray-100 flex-row gap-3">
            <button
              type="button"
              onClick={clearAll}
              disabled={!hasActiveFilter}
              className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="flex-1 h-11 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest transition-colors shadow-sm shadow-rose-200"
            >
              Ver resultados
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
