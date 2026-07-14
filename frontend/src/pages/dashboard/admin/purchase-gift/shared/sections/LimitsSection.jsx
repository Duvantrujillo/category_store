import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "DRAFT",  label: "Borrador", cls: "text-slate-500" },
  { value: "ACTIVE", label: "Activo",   cls: "text-green-600" },
  { value: "PAUSED", label: "Pausado",  cls: "text-amber-600" },
];

export default function LimitsSection({ form, handleChange, errors = {} }) {
  return (
    <div className="space-y-4">

      <div>
        <h3 className="text-sm font-semibold">Vigencia y límites</h3>
        <p className="text-xs text-muted-foreground">Fechas de validez y tope de usos del regalo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Límite de usos total */}
        <div className="space-y-1.5">
          <Label>
            Límite de usos{" "}
            <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
          </Label>
          <Input
            type="number"
            min={1}
            value={form.usageLimit ?? ""}
            onChange={(e) => handleChange("usageLimit", e.target.value)}
            placeholder="Ilimitado"
          />
        </div>

        <div />

        {/* Fecha inicio */}
        <div className="space-y-1.5">
          <Label>Fecha de inicio <span className="text-red-400">*</span></Label>
          <DatePicker
            value={form.startsAt || ""}
            onChange={(v) => handleChange("startsAt", v)}
            placeholder="Seleccionar fecha"
            className="w-full"
            invalid={!!errors.startsAt}
          />
          {errors.startsAt && <p className="text-xs text-destructive">{errors.startsAt}</p>}
        </div>

        {/* Fecha expiración */}
        <div className="space-y-1.5">
          <Label>Fecha de expiración <span className="text-red-400">*</span></Label>
          <DatePicker
            value={form.expiresAt || ""}
            onChange={(v) => handleChange("expiresAt", v)}
            placeholder="Seleccionar fecha"
            className="w-full"
            invalid={!!errors.expiresAt}
          />
          {errors.expiresAt && <p className="text-xs text-destructive">{errors.expiresAt}</p>}
        </div>

      </div>

      {/* Estado */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Estado</Label>
          <p className="text-xs text-muted-foreground">Estado editorial del regalo</p>
        </div>
        <Select
          value={form.status || "DRAFT"}
          onValueChange={(val) => handleChange("status", val)}
        >
          <SelectTrigger className="h-9 w-32 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className={`font-medium ${opt.cls}`}>{opt.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

    </div>
  );
}
