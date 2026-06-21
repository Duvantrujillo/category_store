import { useEffect, useState } from "react";

function DonutChart({ segments = [], size = 130, thickness = 16, centerLabel, centerSub }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 60); return () => clearTimeout(t); }, []);

  const r  = (size - thickness) / 2;
  const c  = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  const total = segments.reduce((s, seg) => s + (seg.value || 0), 0);

  let cum = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
        {ready && total > 0 &&
          segments.map((seg, i) => {
            if (!seg.value) return null;
            const frac  = seg.value / total;
            const start = cum / total;
            cum += seg.value;
            const gap  = segments.length > 1 ? 2.5 : 0;
            const dash = Math.max(0, frac * c - gap);
            return (
              <circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${c}`}
                strokeDashoffset={-(start * c)}
                strokeLinecap="butt"
                style={{ transition: "stroke-dasharray 0.6s ease-out" }}
              />
            );
          })}
      </svg>

      {centerLabel !== undefined && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold text-slate-800 leading-none tabular-nums">{centerLabel}</span>
          {centerSub && <span className="text-[11px] text-slate-400 mt-0.5">{centerSub}</span>}
        </div>
      )}
    </div>
  );
}

export default DonutChart;
