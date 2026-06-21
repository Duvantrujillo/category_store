import { useEffect, useState } from "react";

function HBar({ label, value, max, displayValue, color = "#6366f1", rank }) {
  const [pct, setPct] = useState(0);
  const target = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  useEffect(() => {
    const t = setTimeout(() => setPct(target), 80);
    return () => clearTimeout(t);
  }, [target]);

  return (
    <div className="flex items-center gap-2.5 py-0.5">
      {rank !== undefined && (
        <span className="w-4 text-center text-[10px] font-bold text-slate-300 shrink-0 tabular-nums">{rank}</span>
      )}
      <span className="text-xs text-slate-600 w-28 truncate shrink-0" title={label}>{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color, transition: "width 0.65s cubic-bezier(.25,.8,.25,1)" }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 min-w-[90px] text-right shrink-0 tabular-nums">
        {displayValue}
      </span>
    </div>
  );
}

export default HBar;
