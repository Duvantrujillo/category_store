import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function MultiSelectField({
  label,
  items = [],
  selectedIds = [],
  onChange,
  placeholder = "Todos (sin restricción)",
  getLabel = (item) => item.name,
  error = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery(""); }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = query.trim()
    ? items.filter((i) => getLabel(i).toLowerCase().includes(query.trim().toLowerCase()))
    : items;

  const toggle = (id) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  };

  const selectedItems = items.filter((i) => selectedIds.includes(i.id));

  return (
    <div ref={ref} className="relative space-y-1.5">
      <Label>{label}</Label>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-invalid={!!error}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors outline-none focus:ring-1 focus:ring-ring aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/30"
      >
        <span className={selectedIds.length ? "text-slate-800" : "text-muted-foreground"}>
          {selectedIds.length ? `${selectedIds.length} seleccionado${selectedIds.length !== 1 ? "s" : ""}` : placeholder}
        </span>
        <ChevronDown size={14} className="text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[260px] rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3">
            <Search size={13} className="text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 py-2.5 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-3 py-3 text-xs text-muted-foreground text-center">Sin resultados</p>
            )}
            {filtered.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggle(item.id)}
                  className="accent-indigo-600"
                />
                <span className="truncate">{getLabel(item)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedItems.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-medium"
            >
              {getLabel(item)}
              <button type="button" onClick={() => toggle(item.id)} className="hover:text-indigo-900">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
