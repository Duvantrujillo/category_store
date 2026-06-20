import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

function ProductSearch({ query, setQuery, resultsCount, loading }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-full max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, marca, categoría..."
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
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
