import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchSuggestions } from "../../hooks/useSearchSuggestions";
import noPhotos from "@/assets/icons/no-fotos.png";

const API = import.meta.env.VITE_API_URL;

function getThumb(images) {
  if (!images?.length) return null;
  const main = images.find((img) => Number(img.slot) === 1);
  return main?.imageUrl ?? images[0]?.imageUrl ?? null;
}

function SuggestionsList({ suggestions, onSelect }) {
  if (!suggestions.length) return null;
  return (
    <ul className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-rose-100 rounded-2xl shadow-xl overflow-hidden z-50">
      {suggestions.map((v) => {
        const raw  = getThumb(v.images);
        const src  = raw ? `${API}${raw}` : noPhotos;
        return (
          <li key={v.id}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onSelect(v); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-rose-50 transition-colors text-left"
            >
              <img
                src={src}
                alt={v.product?.name}
                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-rose-50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{v.product?.name}</p>
                {v.product?.brand?.name && (
                  <p className="text-[10px] text-rose-400 font-medium truncate">{v.product.brand.name}</p>
                )}
              </div>
              <span className="text-xs font-bold text-rose-500 shrink-0">
                ${Number(v.price).toLocaleString("es-CO")}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function HomeNavSearch({ onSearch, mobileOpen, onMobileClose }) {
  const [value, setValue]   = useState("");
  const [focused, setFocused] = useState(false);
  const mobileInputRef      = useRef(null);
  const wrapperRef          = useRef(null);
  const mobileWrapperRef    = useRef(null);
  const navigate            = useNavigate();
  const suggestions         = useSearchSuggestions(value);

  useEffect(() => {
    if (mobileOpen) setTimeout(() => mobileInputRef.current?.focus(), 80);
  }, [mobileOpen]);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setFocused(false);
      if (mobileWrapperRef.current && !mobileWrapperRef.current.contains(e.target)) setFocused(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function submit(v) { onSearch?.(v.trim()); }

  function handleSubmit(e) {
    e.preventDefault();
    submit(value);
    setFocused(false);
    onMobileClose?.();
  }

  function handleClear() {
    setValue("");
    submit("");
    setFocused(false);
  }

  function handleMobileClose() {
    setValue("");
    submit("");
    setFocused(false);
    onMobileClose?.();
  }

  function handleSelect(variant) {
    setValue("");
    setFocused(false);
    onMobileClose?.();
    navigate(`/producto/${variant.id}`);
  }

  const showSuggestions = focused && suggestions.length > 0;

  return (
    <>
      {/* ── Barra fija en PC ── */}
      <form onSubmit={handleSubmit} className="flex-1 hidden sm:flex items-center justify-center">
        <div ref={wrapperRef} className="relative w-full max-w-sm">
          <Search size={15} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-300 pointer-events-none" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Buscar productos de maquillaje..."
            className="w-full h-10 pl-9 pr-9 rounded-xl border border-white bg-white text-sm text-rose-900 placeholder-rose-300 outline-none focus:ring-2 focus:ring-white/60 focus:border-white transition-all shadow-sm"
          />
          {value && (
            <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500 transition-colors">
              <X size={14} />
            </button>
          )}
          {showSuggestions && (
            <SuggestionsList suggestions={suggestions} onSelect={handleSelect} />
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
              <div ref={mobileWrapperRef} className="relative flex-1">
                <Search size={15} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-300 pointer-events-none" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onFocus={() => setFocused(true)}
                  placeholder="Buscar productos..."
                  className="w-full h-11 pl-9 pr-9 rounded-xl border border-rose-100 bg-white text-sm text-rose-900 placeholder-rose-300 outline-none focus:border-rose-200 focus:ring-2 focus:ring-rose-100 transition-all shadow-sm"
                />
                {value && (
                  <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500 transition-colors">
                    <X size={14} />
                  </button>
                )}
                {showSuggestions && (
                  <SuggestionsList suggestions={suggestions} onSelect={handleSelect} />
                )}
              </div>
              <button
                type="button"
                onClick={handleMobileClose}
                className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full text-rose-300 hover:bg-rose-50 hover:text-rose-500 transition-colors"
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
