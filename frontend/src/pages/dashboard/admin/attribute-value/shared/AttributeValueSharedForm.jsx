import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AttributeValueSharedForm({
  mode = "create",
  form,
  handleChange,
  loading,
  onCancel,
  onSubmit,
  attributes = [],
}) {

  const isEdit = mode === "edit";

  return (

    <div className="grid gap-4">

      {/* VALUE */}
      <div>

        <Label>Valor</Label>

        <Input
          value={form.value || ""}
          onChange={(e) =>
            handleChange(
              "value",
              e.target.value
            )
          }
          placeholder="Ej: Rojo, XL, Algodón..."
        />

      </div>

      {/* ATTRIBUTE */}
      <div>

        <Label>Atributo</Label>

        <select
          className="w-full border rounded-md h-10 px-3 bg-background"
          value={form.attributeId || ""}
          onChange={(e) =>
            handleChange(
              "attributeId",
              e.target.value
            )
          }
        >

          <option value="">
            Selecciona un atributo
          </option>

          {attributes.map((attribute) => (

            <option
              key={attribute.id}
              value={attribute.id}
            >
              {attribute.name}
            </option>

          ))}

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
              : "Crear valor"
          }

        </Button>

      </div>

    </div>

  );

}