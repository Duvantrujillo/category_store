import { useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";

import SummaryReport   from "../components/SummaryReport";
import SalesReport     from "../components/SalesReport";
import ReturnsReport   from "../components/ReturnsReport";
import RefundsReport   from "../components/RefundsReport";
import ShipmentsReport from "../components/ShipmentsReport";

const TABS = [
  { key: "summary",   label: "Resumen general" },
  { key: "sales",     label: "Ventas" },
  { key: "returns",   label: "Devoluciones" },
  { key: "refunds",   label: "Reembolsos" },
  { key: "shipments", label: "Envíos" },
];

function ReportsPage() {
  const [activeTab, setActiveTab] = useState("summary");
  const [filters, setFilters]     = useState({ from: "", to: "" });
  const [applied, setApplied]     = useState({});

  const apply = () => setApplied({ ...filters });
  const reset = () => { setFilters({ from: "", to: "" }); setApplied({}); };

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BarChart3 size={22} className="text-indigo-600" />
            Reportes
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Analiza el rendimiento del sistema por período.
          </p>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="flex flex-wrap items-end gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-slate-500">Desde</Label>
          <DatePicker
            value={filters.from}
            onChange={(v) => setFilters((p) => ({ ...p, from: v }))}
            placeholder="Fecha inicio"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-slate-500">Hasta</Label>
          <DatePicker
            value={filters.to}
            onChange={(v) => setFilters((p) => ({ ...p, to: v }))}
            placeholder="Fecha fin"
          />
        </div>
        <Button size="sm" onClick={apply} className="bg-indigo-600 hover:bg-indigo-700 text-white h-8">
          Aplicar
        </Button>
        <Button size="sm" variant="outline" onClick={reset} className="h-8">
          <RefreshCw size={13} className="mr-1.5" />
          Limpiar
        </Button>

        {(applied.from || applied.to) && (
          <span className="text-xs text-indigo-600 font-medium self-end pb-0.5">
            Filtro activo: {applied.from || "—"} → {applied.to || "—"}
          </span>
        )}
      </div>

      {/* Pestañas */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto pb-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`
              px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
              ${activeTab === t.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"}
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div>
        {activeTab === "summary"   && <SummaryReport   filters={applied} />}
        {activeTab === "sales"     && <SalesReport     filters={applied} />}
        {activeTab === "returns"   && <ReturnsReport   filters={applied} />}
        {activeTab === "refunds"   && <RefundsReport   filters={applied} />}
        {activeTab === "shipments" && <ShipmentsReport filters={applied} />}
      </div>
    </div>
  );
}

export default ReportsPage;
