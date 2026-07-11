import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function InfoSection({ form, handleChange, errors = {} }) {
  return (
    <div className="space-y-6">

      <div>
        <h3 className="text-sm font-semibold">Información del banner</h3>
        <p className="text-xs text-muted-foreground">Título, enlace, fechas de vigencia y configuración.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Título */}
        <div className="space-y-1.5 md:col-span-2">
          <Label>Título <span className="text-red-400">*</span></Label>
          <Input
            value={form.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Ej: Nueva colección primavera"
            maxLength={40}
            aria-invalid={!!errors.title}
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
        </div>

        {/* Link */}
        <div className="space-y-1.5 md:col-span-2">
          <Label>
            Enlace{" "}
            <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
          </Label>
          <Input
            type="url"
            value={form.link || ""}
            onChange={(e) => handleChange("link", e.target.value)}
            placeholder="https://..."
            maxLength={2048}
            aria-invalid={!!errors.link}
          />
          {errors.link && <p className="text-xs text-destructive">{errors.link}</p>}
        </div>

        {/* Fecha inicio */}
        <div className="space-y-1.5">
          <Label>Fecha de inicio <span className="text-red-400">*</span></Label>
          <DatePicker
            value={form.startDate || ""}
            onChange={(v) => handleChange("startDate", v)}
            placeholder="Seleccionar fecha"
            className="w-full"
            invalid={!!errors.startDate}
          />
          {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
        </div>

        {/* Fecha fin */}
        <div className="space-y-1.5">
          <Label>Fecha de fin <span className="text-red-400">*</span></Label>
          <DatePicker
            value={form.endDate || ""}
            onChange={(v) => handleChange("endDate", v)}
            placeholder="Seleccionar fecha"
            className="w-full"
            invalid={!!errors.endDate}
          />
          {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
        </div>

        {/* Posición */}
        <div className="space-y-1.5">
          <Label>Posición / orden</Label>
          <Input
            type="number"
            min={0}
            value={form.position ?? 0}
            onChange={(e) => handleChange("position", Number(e.target.value))}
            placeholder="0"
          />
        </div>

        {/* Estado */}
        <div className="space-y-1.5">
          <Label>Estado</Label>
          <Select
            value={form.isActive ? "true" : "false"}
            onValueChange={(v) => handleChange("isActive", v === "true")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Activo</span>
                </div>
              </SelectItem>
              <SelectItem value="false">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Inactivo</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  );
}
