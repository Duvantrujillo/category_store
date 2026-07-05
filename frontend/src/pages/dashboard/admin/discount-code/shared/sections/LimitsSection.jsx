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

export default function LimitsSection({ form, handleChange }) {
  return (
    <div className="space-y-4">

      <div>
        <h3 className="text-sm font-semibold">Vigencia y límites</h3>
        <p className="text-xs text-muted-foreground">Fechas de validez, compra mínima y tope de usos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Compra mínima */}
        <div className="space-y-1.5">
          <Label>Compra mínima</Label>
          <Input
            type="number"
            min={0}
            value={form.minimumPurchase ?? "0"}
            onChange={(e) => handleChange("minimumPurchase", e.target.value)}
            placeholder="0"
          />
        </div>

        {/* Máximo de usos */}
        <div className="space-y-1.5">
          <Label>
            Máximo de usos{" "}
            <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
          </Label>
          <Input
            type="number"
            min={1}
            value={form.maxUses ?? ""}
            onChange={(e) => handleChange("maxUses", e.target.value)}
            placeholder="Ilimitado"
          />
        </div>

        {/* Fecha inicio */}
        <div className="space-y-1.5">
          <Label>Fecha de inicio <span className="text-red-400">*</span></Label>
          <DatePicker
            value={form.startsAt || ""}
            onChange={(v) => handleChange("startsAt", v)}
            placeholder="Seleccionar fecha"
            className="w-full"
          />
        </div>

        {/* Fecha expiración */}
        <div className="space-y-1.5">
          <Label>Fecha de expiración <span className="text-red-400">*</span></Label>
          <DatePicker
            value={form.expiresAt || ""}
            onChange={(v) => handleChange("expiresAt", v)}
            placeholder="Seleccionar fecha"
            className="w-full"
          />
        </div>

      </div>

      {/* Estado */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Estado</Label>
          <p className="text-xs text-muted-foreground">Activar o desactivar el cupón</p>
        </div>
        <Select
          value={form.isActive ? "true" : "false"}
          onValueChange={(val) => handleChange("isActive", val === "true")}
        >
          <SelectTrigger className="h-9 w-32 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">
              <span className="text-green-600 font-medium">Activo</span>
            </SelectItem>
            <SelectItem value="false">
              <span className="text-red-600 font-medium">Inactivo</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

    </div>
  );
}
