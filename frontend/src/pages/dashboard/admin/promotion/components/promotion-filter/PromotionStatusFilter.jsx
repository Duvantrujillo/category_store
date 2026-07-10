const OPTIONS = [
  { value: "all",       label: "Todas",      base: "bg-slate-100 text-slate-600 border-slate-200",   on: "bg-slate-700 text-white border-slate-700" },
  { value: "active",    label: "Activa",     base: "bg-green-50 text-green-700 border-green-200",    on: "bg-green-600 text-white border-green-600" },
  { value: "scheduled", label: "Programada", base: "bg-blue-50 text-blue-700 border-blue-200",       on: "bg-blue-600 text-white border-blue-600" },
  { value: "paused",    label: "Pausada",    base: "bg-amber-50 text-amber-700 border-amber-200",    on: "bg-amber-600 text-white border-amber-600" },
  { value: "draft",     label: "Borrador",   base: "bg-slate-50 text-slate-600 border-slate-200",    on: "bg-slate-600 text-white border-slate-600" },
  { value: "expired",   label: "Expirada",   base: "bg-orange-50 text-orange-700 border-orange-200", on: "bg-orange-500 text-white border-orange-500" },
];

export default function PromotionStatusFilter({ value, onChange }) {
  return (
    <div className="flex items-center gap-1.5 h-9 border-l border-slate-200 pl-3 flex-wrap">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all duration-150 whitespace-nowrap ${
            value === opt.value ? opt.on : opt.base + " hover:brightness-95"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
