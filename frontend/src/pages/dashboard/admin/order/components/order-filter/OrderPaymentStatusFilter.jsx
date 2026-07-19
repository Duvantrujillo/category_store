const OPTIONS = [
  { value: "all",     label: "Todas",      base: "bg-slate-100 text-slate-600 border-slate-200", on: "bg-slate-700 text-white border-slate-700" },
  { value: "PAID",    label: "Pagadas",    base: "bg-green-50 text-green-700 border-green-200",  on: "bg-green-600 text-white border-green-600" },
  { value: "PENDING", label: "Pendientes", base: "bg-amber-50 text-amber-700 border-amber-200",  on: "bg-amber-600 text-white border-amber-600" },
];

// Se combina con la búsqueda/rango de fechas de OrderSearch — se aplica como
// un filtro adicional sobre lo que sea que esas dos ya hayan resuelto (ver
// OrderList.jsx), así que "Pagadas" + "Hoy" muestra las pagadas de hoy.
export default function OrderPaymentStatusFilter({ value, onChange }) {
  return (
    <div className="flex items-center gap-1.5 h-8 border-l border-slate-200 pl-3">
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
