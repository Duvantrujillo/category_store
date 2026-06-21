import { useEffect, useState } from "react";

function VBarChart({ data = [], height = 150 }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 80); return () => clearTimeout(t); }, []);

  const max  = Math.max(...data.map((d) => d.value), 1);
  const barH = height - 48;

  if (!data.length) return null;

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => {
        const h = ready ? Math.max(4, Math.round((d.value / max) * barH)) : 4;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
            <span className="text-[10px] font-bold text-slate-600 tabular-nums">{d.value}</span>
            <div
              className="w-full rounded-t-md"
              style={{
                height: `${h}px`,
                backgroundColor: d.color ?? "#6366f1",
                transition: "height 0.65s cubic-bezier(.25,.8,.25,1)",
              }}
            />
            <span className="text-[9px] text-slate-400 text-center leading-tight px-0.5 line-clamp-2 w-full">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default VBarChart;
