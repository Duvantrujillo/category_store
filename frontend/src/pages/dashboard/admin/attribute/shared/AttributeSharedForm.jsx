import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export default function AttributeSharedForm({
  mode = "create",
  form,
  handleChange,
  loading,
  onCancel,
  onSubmit,
}) {

  const isEdit = mode === "edit";

  return (
    <div className="grid gap-4">

      {/* NAME */}
      <div>

        <Label>Nombre</Label>

        <Input
          value={form.name || ""}
          onChange={(e) =>
            handleChange("name", e.target.value)
          }
          placeholder="Nombre del atributo"
        />

      </div>

    
{/* IS ACTIVE */}
<div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">

  {/* TEXTO */}
  <div className="space-y-0.5">
    <Label className="text-sm font-medium">Estado</Label>
    <p className="text-xs text-muted-foreground">
      Activar o desactivar atributo
    </p>
  </div>

  {/* SELECT MÁS COMPACTO */}
  <Select
    value={form.isActive ? "true" : "false"}
    onValueChange={(val) =>
      handleChange("isActive", val === "true")
    }
  >
    <SelectTrigger className="h-9 w-32 text-sm">
      <SelectValue placeholder="Selecciona estado" />
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

      {/* BOTONES */}
      <div className="flex justify-end gap-2 mt-4">

        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>

        <Button
          onClick={onSubmit}
          disabled={loading}
        >

          {loading
            ? isEdit
              ? "Guardando..."
              : "Creando..."
            : isEdit
              ? "Guardar cambios"
              : "Crear atributo"
          }

        </Button>

      </div>

    </div>
  );
}