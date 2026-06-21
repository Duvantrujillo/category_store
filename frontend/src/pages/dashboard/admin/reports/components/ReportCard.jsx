function ReportCard({
  title,
  value,
  sub,
  colorClass = "text-indigo-600",
  icon: Icon,
  accent,
}) {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm overflow-hidden group">
      {accent && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${accent}`} />
      )}
      <div className="flex items-start justify-between gap-2 pl-0.5">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 leading-none mb-2.5">
            {title}
          </p>
          <p className={`text-2xl font-bold leading-none tabular-nums ${colorClass}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-2 leading-snug">{sub}</p>}
        </div>
        {Icon && (
          <div className={`shrink-0 p-2 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors`}>
            <Icon size={15} className={colorClass} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportCard;
