import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

function buildPages(current, total) {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  const around = new Set(
    [1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total)
  );
  const sorted = [...around].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("ellipsis");
    result.push(sorted[i]);
  }
  return result;
}

export default function TablePagination({ page, pageSize, totalItems, onPageChange, className }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pages = useMemo(() => buildPages(page, totalPages), [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className={cn(
      "border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 grid grid-cols-3 items-center",
      className
    )}>

      {/* Izquierda: vacío para mantener el centro real */}
      <div />

      {/* Centro: botones */}
      <div className="flex items-center justify-center gap-0.5">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center justify-center h-7 w-7 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e-${i}`} className="text-xs text-slate-300 px-1 leading-none select-none">
              •••
            </span>
          ) : (
            <button
              key={p}
              onClick={() => p !== page && onPageChange(p)}
              className={cn(
                "flex items-center justify-center h-7 min-w-7 px-1.5 rounded text-xs font-medium transition-colors",
                p === page
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center justify-center h-7 w-7 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Derecha: indicador de página — alineado con columna Acciones */}
      <p className="text-xs text-slate-400 leading-none text-right pr-8">
        Página{" "}
        <span className="font-semibold text-slate-600">{page}</span>
        {" "}de{" "}
        <span className="font-semibold text-slate-600">{totalPages}</span>
      </p>

    </div>
  );
}
