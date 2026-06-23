import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function HomeNavSearch({ onSearch, mobileOpen, onMobileClose }) {
  const [value, setValue] = useState("");
  const mobileInputRef    = useRef(null);

  useEffect(() => {
    if (mobileOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 80);
    }
  }, [mobileOpen]);

  function submit(v) {
    if (onSearch) onSearch(v.trim());
  }

  function handleSubmit(e) {
    e.preventDefault();
    submit(value);
    onMobileClose?.();
  }

  function handleClear() {
    setValue("");
    submit("");
  }

  function handleMobileClose() {
    setValue("");
    submit("");
    onMobileClose?.();
  }

  return (
    <>
      {/* ── Barra fija en PC ── */}
      <form onSubmit={handleSubmit} className="flex-1 hidden sm:flex items-center justify-center">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-300 pointer-events-none" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Buscar productos de maquillaje..."
            className="w-full h-10 pl-9 pr-9 rounded-full border border-rose-200 bg-rose-50/60 text-sm text-rose-900 placeholder-rose-300 outline-none focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all"
          />
          {value && (
            <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {/* ── Panel deslizable en móvil ── */}
      {mobileOpen && (
        <>
          <div
            className="sm:hidden fixed inset-0 z-40 bg-rose-900/10 backdrop-blur-sm"
            onClick={handleMobileClose}
          />
          <div className="sm:hidden fixed top-16 left-0 right-0 z-50 bg-white border-b border-rose-100 shadow-lg px-4 py-3 animate-[fadeSlideUp_0.18s_ease_forwards]">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-300 pointer-events-none" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full h-11 pl-9 pr-9 rounded-full border border-rose-200 bg-rose-50/60 text-sm text-rose-900 placeholder-rose-300 outline-none focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all"
                />
                {value && (
                  <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleMobileClose}
                className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full text-rose-400 hover:bg-rose-50 transition-colors"
                aria-label="Cerrar búsqueda"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
