import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InfoSection({ form, handleChange, errors = {} }) {
  return (
    <div className="space-y-6">

      <div>
        <h3 className="text-sm font-semibold">Información de la marca</h3>
        <p className="text-xs text-muted-foreground">Nombre y estado de visibilidad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Nombre */}
        <div className="space-y-1.5">
          <Label>Nombre <span className="text-red-400">*</span></Label>
          <Input
            value={form.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ej: Nike, Adidas..."
            maxLength={25}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
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
