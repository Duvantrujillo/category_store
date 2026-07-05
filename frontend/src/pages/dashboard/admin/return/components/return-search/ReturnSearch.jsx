import { useState } from "react";
import { format, subDays, startOfMonth } from "date-fns";
import { Search, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";

const now = new Date();
const fmt = (d) => format(d, "yyyy-MM-dd");

const PRESETS = [
  { label: "Hoy",      from: fmt(now),               to: fmt(now) },
  { label: "Ayer",     from: fmt(subDays(now, 1)),    to: fmt(subDays(now, 1)) },
  { label: "7 días",   from: fmt(subDays(now, 6)),    to: fmt(now) },
  { label: "Este mes", from: fmt(startOfMonth(now)),  to: fmt(now) },
];

function ReturnSearch({
  query, setQuery, resultsCount, loading,
  dateFrom, setDateFrom, dateTo, setDateTo,
}) {
  const [activePreset, setActivePreset] = useState(null);

  const applyPreset = (preset, idx) => {
    setQuery("");
    setDateFrom(preset.from);
    setDateTo(preset.to);
    setActivePreset(idx);
  };

  const handleQueryChange = (val) => {
    setQuery(val);
    if (val) { setDateFrom(""); setDateTo(""); setActivePreset(null); }
  };

  const handleDateFromChange = (val) => {
    setDateFrom(val);
    setActivePreset(null);
    if (val) setQuery("");
    if (!val) setDateTo("");
  };

  const handleDateToChange = (val) => {
    setDateTo(val);
    setActivePreset(null);
    if (val) setQuery("");
  };

  const handleClear = () => { setDateFrom(""); setDateTo(""); setActivePreset(null); };

  const isTextActive = query.trim().length > 0;
  const isDateActive = !!dateFrom;

  return (
    <div className="flex items-center gap-2 flex-wrap">

      {/* Buscador */}
      <div className="flex items-center gap-2 h-8 bg-white border border-slate-200 rounded-xl shadow-sm px-3 transition-all focus-within:border-indigo-300 focus-within:shadow-md focus-within:shadow-indigo-100/60 min-w-44">
        <Search size={13} className="text-slate-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Buscar motivo, orden, cliente..."
          className="flex-1 bg-transparent text-xs outline-none text-slate-800 placeholder:text-slate-400 min-w-0"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600 shrink-0">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Separador */}
      <div className="w-px h-5 bg-slate-200" />

      {/* Rango de fechas */}
      <div className="flex items-center gap-1.5 [&_button]:h-8 [&_button]:text-xs [&_button]:px-2.5">
        <DatePicker value={dateFrom} onChange={handleDateFromChange} placeholder="Desde" />
        <span className="text-xs text-slate-400">—</span>
        <DatePicker value={dateTo} onChange={handleDateToChange} placeholder="Hasta" />
      </div>

      {isDateActive && (
        <Button size="sm" variant="outline" onClick={handleClear} className="h-8 px-2.5">
          <RefreshCw size={12} />
        </Button>
      )}

      {/* Separador */}
      <div className="w-px h-5 bg-slate-200" />

      {/* Presets */}
      {PRESETS.map((p, i) => (
        <button
          key={p.label}
          onClick={() => applyPreset(p, i)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
            activePreset === i
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
          }`}
        >
          {p.label}
        </button>
      ))}

      {/* Contador */}
      {(isTextActive || isDateActive) && !loading && (
        <span className="text-xs text-slate-400 whitespace-nowrap ml-1">
          {resultsCount} resultado{resultsCount !== 1 ? "s" : ""}
        </span>
      )}
      {loading && <span className="text-xs text-slate-400 whitespace-nowrap ml-1">Buscando...</span>}

    </div>
  );
}

export default ReturnSearch;
