import { Search, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";

function ShippingSearch({
  query, setQuery, resultsCount, loading,
  dateFrom, setDateFrom, dateTo, setDateTo,
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
  const isDateActive = !!dateFrom;

  return (
    <div className="flex items-center gap-3">

      <div className="flex items-center gap-2 w-64 h-9 bg-white border border-slate-200 rounded-xl shadow-sm px-3 transition-all focus-within:border-indigo-300 focus-within:shadow-md focus-within:shadow-indigo-100/60">
        <Search size={15} className="text-slate-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Buscar por nombre, documento o municipio..."
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

      <div className="flex items-center gap-2">
        <DatePicker value={dateFrom} onChange={handleDateFromChange} placeholder="Desde" />
        <span className="text-xs text-muted-foreground">—</span>
        <DatePicker value={dateTo} onChange={handleDateToChange} placeholder="Hasta" />
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

export default ShippingSearch;
