const SORT_OPTIONS = [
  { value: "",           label: "Relevancia" },
  { value: "price_asc",  label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "newest",     label: "Más recientes" },
];

export default function HomeProductFilters({ minPrice, maxPrice, sortBy, onChange }) {
  const hasActiveFilter = !!(minPrice || maxPrice || sortBy);

  return (
    <div className="flex flex-wrap items-center gap-2.5 mb-4 px-4 sm:px-0">
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={minPrice}
          onChange={(e) => onChange({ minPrice: e.target.value })}
          placeholder="Precio mín."
          aria-label="Precio mínimo"
          className="w-28 h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-700 outline-none focus:border-rose-300 transition-colors"
        />
        <span className="text-gray-300 text-xs">—</span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={maxPrice}
          onChange={(e) => onChange({ maxPrice: e.target.value })}
          placeholder="Precio máx."
          aria-label="Precio máximo"
          className="w-28 h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-700 outline-none focus:border-rose-300 transition-colors"
        />
      </div>

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
          onClick={() => onChange({ minPrice: "", maxPrice: "", sortBy: "" })}
          className="text-xs font-medium text-rose-400 hover:text-rose-500 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
