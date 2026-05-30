import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

    
      {/* TYPE */}
      <div>

        <Label>Tipo</Label>

        <select
          className="w-full border rounded-md h-10 px-3 bg-background"
          value={form.type || ""}
          onChange={(e) =>
            handleChange("type", e.target.value)
          }
        >

          <option value="">
            Selecciona un tipo
          </option>

          <option value="TEXT">Texto</option>
          <option value="NUMBER">Número</option>
          <option value="BOOLEAN">Booleano</option>
          <option value="SELECT">Selección</option>
          <option value="COLOR">Color</option>

        </select>

      </div>
{/* IS ACTIVE */}
<div className="flex items-center justify-between border rounded-lg p-3">

  <div className="space-y-1">

    <Label>Estado</Label>

    <p className="text-sm text-muted-foreground">
      Activar o desactivar atributo
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

    {/* 🔥 OPCIÓN ACTIVO */}
    <option
      value="true"
      className="bg-green-100 text-green-700"
    >
      Activo
    </option>

    {/* 🔥 OPCIÓN INACTIVO */}
    <option
      value="false"
      className="bg-red-100 text-red-700"
    >
      Inactivo
    </option>

  </select>

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