import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPE_OPTIONS = [
  { value: "PERCENTAGE",    label: "Porcentaje (%)" },
  { value: "FIXED_AMOUNT",  label: "Monto fijo ($)" },
];

export default function InfoSection({ form, handleChange }) {
  return (
    <div className="space-y-4">

      <div>
        <h3 className="text-sm font-semibold">Información de la promoción</h3>
        <p className="text-xs text-muted-foreground">Nombre, descripción y tipo de descuento.</p>
      </div>

      {/* Nombre */}
      <div className="space-y-1.5">
        <Label>Nombre <span className="text-red-400">*</span></Label>
        <Input
          value={form.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Ej: Rebajas de verano"
          maxLength={150}
        />
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <Label>
          Descripción{" "}
          <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
        </Label>
        <Textarea
          value={form.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Descripción interna de la promoción"
          className="resize-none min-h-16"
          maxLength={500}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Tipo */}
        <div className="space-y-1.5">
          <Label>Tipo de promoción <span className="text-red-400">*</span></Label>
          <Select
            value={form.type || "PERCENTAGE"}
            onValueChange={(val) => handleChange("type", val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Valor */}
        <div className="space-y-1.5">
          <Label>
            {form.type === "PERCENTAGE" ? "Porcentaje" : "Monto"}
            <span className="text-red-400"> *</span>
          </Label>
          <Input
            type="number"
            min={0}
            max={form.type === "PERCENTAGE" ? 100 : undefined}
            value={form.value ?? ""}
            onChange={(e) => handleChange("value", e.target.value)}
            placeholder={form.type === "PERCENTAGE" ? "Ej: 20" : "Ej: 10000"}
          />
        </div>

      </div>
    </div>
  );
}
