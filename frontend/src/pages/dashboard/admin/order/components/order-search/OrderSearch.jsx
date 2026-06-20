import { Search, X, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";

function OrderSearch({
  query, setQuery, queryResults, queryLoading,
  dateFrom, setDateFrom, dateTo, setDateTo, dateResults, dateLoading,
}) {
  const handleQueryChange = (val) => {
    setQuery(val);
    if (val) { setDateFrom(""); setDateTo(""); }
  };

  const handleDateFromChange = (val) => {
    setDateFrom(val);
    if (val) setQuery("");
    if (!val) setDateTo("");
  };

  const handleDateToChange = (val) => {
    setDateTo(val);
    if (val) setQuery("");
  };

  const isTextActive = query.trim().length > 0;
  const isDateActive = dateFrom.length > 0;
  const loading = queryLoading || dateLoading;
  const resultsCount = isTextActive ? queryResults.length : dateResults.length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Buscar por orden, nombre, correo..."
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

      <div className="flex items-center gap-2">
        <DatePicker
          value={dateFrom}
          onChange={handleDateFromChange}
          placeholder="Desde"
        />
        <span className="text-xs text-muted-foreground">—</span>
        <DatePicker
          value={dateTo}
          onChange={handleDateToChange}
          placeholder="Hasta"
        />
        {isDateActive && (
          <Button size="sm" variant="outline" onClick={() => { setDateFrom(""); setDateTo(""); }} className="h-8">
            <RefreshCw size={13} className="mr-1.5" />
            Limpiar
          </Button>
        )}
      </div>

      {(isTextActive || isDateActive) && !loading && (
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

export default OrderSearch;
