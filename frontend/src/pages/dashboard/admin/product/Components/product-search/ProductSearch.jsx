import { Search, X } from "lucide-react";

function ProductSearch({ query, setQuery, resultsCount, loading }) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex items-center gap-2 w-72 h-9 bg-white border border-slate-200 rounded-xl shadow-sm px-3 transition-all focus-within:border-indigo-300 focus-within:shadow-md focus-within:shadow-indigo-100/60">
        <Search size={15} className="text-slate-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, marca, categoría..."
          className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400 min-w-0"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {query.trim() && !loading && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {resultsCount} resultado{resultsCount !== 1 ? "s" : ""}
        </span>
      )}
      {loading && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">Buscando...</span>
      )}

    </div>
  );
}

export default ProductSearch;
