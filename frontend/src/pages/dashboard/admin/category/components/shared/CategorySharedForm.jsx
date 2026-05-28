import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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

{/* Estado */}
<div className="flex items-center justify-between border rounded-lg p-3">

  <div className="space-y-1">

    <Label>Estado</Label>

    <p className="text-sm text-muted-foreground">
      Activar o desactivar categoría
    </p>

  </div>

  <select
    className={`
      border rounded-md h-10 px-3 font-medium transition-colors
      ${form.isActive
        ? "bg-green-100 text-green-700 border-green-300"
        : "bg-red-100 text-red-700 border-red-300"
      }
    `}
    value={form.isActive ? "true" : "false"}
    onChange={(e) =>
      handleChange(
        "isActive",
        e.target.value === "true"
      )
    }
  >
    <option
      value="true"
      className="bg-green-100 text-green-700"
    >
      Activo
    </option>

    <option
      value="false"
      className="bg-red-100 text-red-700"
    >
      Inactivo
    </option>

  </select>

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