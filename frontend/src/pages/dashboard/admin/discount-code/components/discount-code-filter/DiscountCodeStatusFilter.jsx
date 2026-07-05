const OPTIONS = [
  { value: "all",       label: "Todos",      base: "bg-slate-100 text-slate-600 border-slate-200",   on: "bg-slate-700 text-white border-slate-700" },
  { value: "active",    label: "Activo",     base: "bg-green-50 text-green-700 border-green-200",    on: "bg-green-600 text-white border-green-600" },
  { value: "scheduled", label: "Programado", base: "bg-blue-50 text-blue-700 border-blue-200",       on: "bg-blue-600 text-white border-blue-600" },
  { value: "expired",   label: "Expirado",   base: "bg-orange-50 text-orange-700 border-orange-200", on: "bg-orange-500 text-white border-orange-500" },
  { value: "inactive",  label: "Inactivo",   base: "bg-red-50 text-red-600 border-red-200",          on: "bg-red-500 text-white border-red-500" },
];

export default function DiscountCodeStatusFilter({ value, onChange }) {
  return (
    <div className="flex items-center gap-1.5 h-9 border-l border-slate-200 pl-3">
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
