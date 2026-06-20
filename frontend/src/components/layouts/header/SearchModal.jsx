import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, LayoutGrid, Tags, Package, ClipboardList, Loader2, ArrowRight } from "lucide-react";
import { globalSearch } from "@/api/searchApi";

const SECTION_META = {
  categories:  { label: "Categorías",  icon: LayoutGrid,    url: (r) => `/dashboard/admin/list/category` },
  brands:      { label: "Marcas",       icon: Tags,          url: (r) => `/dashboard/admin/list/brand` },
  products:    { label: "Productos",    icon: Package,       url: (r) => `/dashboard/admin/list/product` },
  orders:      { label: "Órdenes",      icon: ClipboardList, url: (r) => `/dashboard/admin/list/order` },
};

function ResultItem({ icon: Icon, label, sub, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
        active ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-700"
      }`}
    >
      <span className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${
        active ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
      }`}>
        <Icon size={14} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium truncate">{label}</span>
        {sub && <span className="block text-xs text-slate-400 truncate">{sub}</span>}
      </span>
      <ArrowRight size={13} className={`shrink-0 ${active ? "text-indigo-400" : "text-slate-300"}`} />
    </button>
  );
}

export default function SearchModal({ open, onClose }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef  = useRef(null);
  const timerRef  = useRef(null);
  const navigate  = useNavigate();

  // Foco al abrir
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(null);
      setActiveIdx(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounce search
  const search = useCallback((q) => {
    clearTimeout(timerRef.current);
    if (!q || q.length < 2) { setResults(null); setLoading(false); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await globalSearch(q);
        setResults(data.results);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  useEffect(() => { search(query); }, [query, search]);

  // Flatten items for keyboard nav
  const flatItems = results
    ? Object.entries(SECTION_META).flatMap(([key, meta]) =>
        (results[key] || []).map((r) => ({ ...r, _type: key, _meta: meta }))
      )
    : [];

  const navigate_to = (item) => {
    navigate(item._meta.url(item));
    onClose();
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flatItems.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    }
    if (e.key === "Enter" && activeIdx >= 0 && flatItems[activeIdx]) {
      navigate_to(flatItems[activeIdx]);
    }
  };

  if (!open) return null;

  const hasResults = results && Object.values(results).some((arr) => arr.length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          {loading
            ? <Loader2 size={16} className="text-indigo-500 shrink-0 animate-spin" />
            : <Search size={16} className="text-slate-400 shrink-0" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(-1); }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar categorías, marcas, productos, órdenes…"
            className="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded-md">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {!query || query.length < 2 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              Escribe al menos 2 caracteres para buscar…
            </p>
          ) : loading && !results ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">Buscando…</p>
          ) : !hasResults ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              Sin resultados para <span className="font-medium text-slate-600">"{query}"</span>
            </p>
          ) : (
            <div className="py-2">
              {Object.entries(SECTION_META).map(([key, meta]) => {
                const items = results[key] || [];
                if (!items.length) return null;
                const Icon = meta.icon;
                return (
                  <div key={key}>
                    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Icon size={11} />
                      {meta.label}
                    </p>
                    {items.map((item) => {
                      const flatIdx = flatItems.findIndex(
                        (f) => f._type === key && f.id === item.id
                      );
                      const label =
                        key === "orders"
                          ? item.orderNumber
                          : item.name;
                      const sub =
                        key === "orders"
                          ? `${item.firstName} ${item.lastName} · ${item.status}`
                          : item.slug;
                      return (
                        <ResultItem
                          key={item.id}
                          icon={Icon}
                          label={label}
                          sub={sub}
                          active={flatIdx === activeIdx}
                          onClick={() => navigate_to({ ...item, _type: key, _meta: meta })}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-end gap-3 px-4 py-2 border-t border-slate-100 bg-slate-50/80">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono">↑↓</kbd>
            navegar
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono">↵</kbd>
            ir
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono">Esc</kbd>
            cerrar
          </span>
        </div>
      </div>
    </div>
  );
}
