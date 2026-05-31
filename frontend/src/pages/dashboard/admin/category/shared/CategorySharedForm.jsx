import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export default function CategorySharedForm({
  mode = "create",
  form,
  handleChange,
  loading,
  onCancel,
  onSubmit,
  categories = [],
}) {

  const isEdit = mode === "edit";

  return (
    <div className="grid gap-4">

      {/* Nombre */}
      <div>

        <Label>Nombre</Label>

        <Input
          value={form.name || ""}
          onChange={(e) =>
            handleChange("name", e.target.value)
          }
          placeholder="Nombre de la categoría"
        />

      </div>

      {/* Descripción */}
      <div>

        <Label>Descripción</Label>

        <Textarea
          value={form.description || ""}
          onChange={(e) =>
            handleChange("description", e.target.value)
          }
          placeholder="Descripción de la categoría"
        />

      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 px-3 py-3">

        {/* TEXTO */}
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">
            Estado
          </Label>

          <p className="text-xs text-muted-foreground">
            Activar o desactivar categoría
          </p>
        </div>

        {/* SELECT MODERNO */}
        <Select
          value={form.isActive ? "true" : "false"}
          onValueChange={(val) =>
            handleChange("isActive", val === "true")
          }
        >
          <SelectTrigger className="h-9 w-30 text-sm">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="true">
              <span className="text-green-600 font-medium">
                Activo
              </span>
            </SelectItem>

            <SelectItem value="false">
              <span className="text-red-600 font-medium">
                Inactivo
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* Orden */}
      <div>

        <Label>Orden</Label>

        <Input
          type="number"
          value={form.sortOrder}
          onChange={(e) =>
            handleChange(
              "sortOrder",
              e.target.value
            )
          }
        />

      </div>

      {/* Categoría Padre */}
      <div>

        <Label>Categoría Padre</Label>

        <select
          className="w-full border rounded-md h-10 px-3 bg-background"
          value={form.parentId != null ? String(form.parentId) : ""}
          onChange={(e) =>
            handleChange(
              "parentId",
              e.target.value ? Number(e.target.value) : null
            )
          }
        >
          <option value="">
            Sin categoría padre
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

      </div>

      {/* Botones */}
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
              : "Crear categoría"}
        </Button>

      </div>

    </div>
  );
}