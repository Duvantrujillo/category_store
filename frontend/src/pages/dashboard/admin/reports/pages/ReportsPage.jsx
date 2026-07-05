import { useState } from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
  Calendar, LayoutDashboard, TrendingUp,
  RotateCcw, Wallet, Truck, ShieldOff, FileSpreadsheet, TicketPercent,
} from "lucide-react";
import { Button }     from "@/components/ui/button";
import { Label }      from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { useHasPermission } from "@/lib/permissions";

import SummaryReport   from "../components/SummaryReport";
import SalesReport     from "../components/SalesReport";
import ReturnsReport   from "../components/ReturnsReport";
import RefundsReport   from "../components/RefundsReport";
import ShipmentsReport from "../components/ShipmentsReport";
import DetailedReport  from "../components/DetailedReport";
import DiscountCodeReport from "../components/DiscountCodeReport";

const fmtDate = (d) => format(d, "yyyy-MM-dd");
const now     = new Date();

const PRESETS = [
  { label: "Hoy",       from: fmtDate(now),                                    to: fmtDate(now) },
  { label: "Ayer",      from: fmtDate(subDays(now, 1)),                        to: fmtDate(subDays(now, 1)) },
  { label: "7 días",    from: fmtDate(subDays(now, 6)),                        to: fmtDate(now) },
  { label: "30 días",   from: fmtDate(subDays(now, 29)),                       to: fmtDate(now) },
  { label: "Este mes",  from: fmtDate(startOfMonth(now)),                       to: fmtDate(now) },
  { label: "Mes ant.",  from: fmtDate(startOfMonth(subMonths(now, 1))),         to: fmtDate(endOfMonth(subMonths(now, 1))) },
];

const TABS = [
  { key: "summary",   label: "Resumen",     icon: LayoutDashboard  },
  { key: "sales",     label: "Ventas",      icon: TrendingUp       },
  { key: "returns",   label: "Devoluciones",icon: RotateCcw        },
  { key: "refunds",   label: "Reembolsos",  icon: Wallet           },
  { key: "shipments", label: "Envíos",      icon: Truck            },
  { key: "detailed",  label: "Detallado",   icon: FileSpreadsheet  },
  { key: "coupons",   label: "Cupones",     icon: TicketPercent    },
];

function ReportsPage() {
  const canView = useHasPermission("reports.view");
  const [activeTab, setActiveTab]       = useState("summary");
  const [filters, setFilters]           = useState({ from: "", to: "" });
  const [applied, setApplied]           = useState({});
  const [activePreset, setActivePreset] = useState(null);

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <ShieldOff size={40} className="opacity-40" />
        <p className="text-sm">No tienes permisos para visualizar esta sección.</p>
      </div>
    );
  }

  const applyPreset = (preset, idx) => {
    const f = { from: preset.from, to: preset.to };
    setFilters(f);
    setApplied(f);
    setActivePreset(idx);
  };

  const apply = () => { setApplied({ ...filters }); setActivePreset(null); };
  const reset  = () => { setFilters({ from: "", to: "" }); setApplied({}); setActivePreset(null); };

  return (
    <div className="px-6 pt-2 pb-6 space-y-5">

      {/* Panel de filtros */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
        {/* Presets rápidos */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
            <Calendar size={11} />
            Período rápido
          </span>
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p, i)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border whitespace-nowrap ${
                activePreset === i
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Rango personalizado */}
        <div className="flex flex-wrap items-end gap-3 px-5 py-3">
          <div className="flex flex-col gap-1">
            <Label className="text-[11px] font-medium text-slate-400">Desde</Label>
            <DatePicker
              value={filters.from}
              onChange={(v) => { setFilters((p) => ({ ...p, from: v })); setActivePreset(null); }}
              placeholder="Fecha inicio"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-[11px] font-medium text-slate-400">Hasta</Label>
            <DatePicker
              value={filters.to}
              onChange={(v) => { setFilters((p) => ({ ...p, to: v })); setActivePreset(null); }}
              placeholder="Fecha fin"
            />
          </div>
          <Button size="sm" onClick={apply} className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-4">
            Aplicar
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="h-8 text-slate-500">
            Limpiar
          </Button>

          {(applied.from || applied.to) && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
              <Calendar size={11} />
              {applied.from || "inicio"} → {applied.to || "hoy"}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-slate-200 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap
                border-b-2 transition-all duration-150
                ${active
                  ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"}
              `}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Contenido activo */}
      <div>
        {activeTab === "summary"   && <SummaryReport   filters={applied} />}
        {activeTab === "sales"     && <SalesReport     filters={applied} />}
        {activeTab === "returns"   && <ReturnsReport   filters={applied} />}
        {activeTab === "refunds"   && <RefundsReport   filters={applied} />}
        {activeTab === "shipments" && <ShipmentsReport filters={applied} />}
        {activeTab === "detailed"  && <DetailedReport  filters={applied} />}
        {activeTab === "coupons"   && <DiscountCodeReport filters={applied} />}
      </div>
    </div>
  );
}

export default ReportsPage;
