import { useState, useRef, useEffect } from "react";
import { CalendarIcon, X } from "lucide-react";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function toDateObject(str) {
  if (!str) return undefined;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDateString(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function DatePicker({ value, onChange, placeholder = "Seleccionar fecha", className, invalid = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = toDateObject(value);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSelect = (date) => {
    onChange(toDateString(date));
    setOpen(false);
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange("");
    setOpen(false);
  };

  const displayLabel = selected
    ? selected.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
    : placeholder;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="relative w-full">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          aria-invalid={invalid}
          className={cn(
            "h-9 w-full justify-start gap-2 text-sm font-normal",
            selected ? "pr-8" : "pr-3",
            !selected && "text-slate-400"
          )}
        >
          <CalendarIcon size={14} className="shrink-0 text-slate-400" />
          <span className="flex-1 truncate text-left">{displayLabel}</span>
        </Button>

        {selected && (
          <span
            onMouseDown={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <X size={12} />
          </span>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1.5 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            locale={es}
            captionLayout="dropdown"
            initialFocus
          />
        </div>
      )}
    </div>
  );
}

export { DatePicker };
