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
  { value: "FIXED",         label: "Monto fijo ($)" },
  { value: "FREE_SHIPPING", label: "Envío gratis" },
];

export default function InfoSection({ form, handleChange, errors = {} }) {
  const isFreeShipping = form.type === "FREE_SHIPPING";

  return (
    <div className="space-y-4">

      <div>
        <h3 className="text-sm font-semibold">Información del cupón</h3>
        <p className="text-xs text-muted-foreground">Código, descripción y tipo de descuento.</p>
      </div>

      {/* Código */}
      <div className="space-y-1.5">
        <Label>Código <span className="text-red-400">*</span></Label>
        <Input
          value={form.code || ""}
          onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
          placeholder="Ej: VERANO20"
          maxLength={30}
          className="font-mono"
          aria-invalid={!!errors.code}
        />
        {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
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
          placeholder="Descripción interna del cupón"
          className="resize-none min-h-16"
          maxLength={500}
          aria-invalid={!!errors.description}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Tipo */}
        <div className="space-y-1.5">
          <Label>Tipo de descuento <span className="text-red-400">*</span></Label>
          <Select
            value={form.type || "PERCENTAGE"}
            onValueChange={(val) => {
              handleChange("type", val);
              // Envío gratis no usa "valor" — se fija en 0 para no arrastrar
              // un número de un tipo anterior (ej. 20 de un % ya elegido).
              if (val === "FREE_SHIPPING") handleChange("value", "0");
            }}
          >
            <SelectTrigger aria-invalid={!!errors.type}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
        </div>

        {/* Valor */}
        <div className="space-y-1.5">
          <Label>
            {form.type === "PERCENTAGE" ? "Porcentaje" : form.type === "FIXED" ? "Monto" : "Valor"}
            {!isFreeShipping && <span className="text-red-400"> *</span>}
          </Label>
          <Input
            type="number"
            min={0}
            max={form.type === "PERCENTAGE" ? 100 : undefined}
            value={form.value ?? ""}
            onChange={(e) => handleChange("value", e.target.value)}
            placeholder={form.type === "PERCENTAGE" ? "Ej: 20" : "Ej: 10000"}
            disabled={isFreeShipping}
            aria-invalid={!!errors.value}
          />
          {errors.value && <p className="text-xs text-destructive">{errors.value}</p>}
        </div>

      </div>
    </div>
  );
}
