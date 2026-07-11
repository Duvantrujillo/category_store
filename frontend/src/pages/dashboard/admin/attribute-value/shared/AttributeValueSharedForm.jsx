import { useState } from "react";
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
  const [attempted, setAttempted] = useState(false);

  // Mismas reglas que valida el backend (atrtribute-value.controller.js).
  const getErrors = () => {
    const errors = {};
    const value = (form.value || "").trim();
    if (!value) errors.value = "El valor es obligatorio";
    else if (value.length > 20) errors.value = "El valor no puede superar 20 caracteres";

    if (!form.attributeId) errors.attributeId = "Selecciona un atributo";
    return errors;
  };

  const errors = attempted ? getErrors() : {};

  const handleSubmit = () => {
    if (Object.keys(getErrors()).length > 0) {
      setAttempted(true);
      return;
    }
    onSubmit();
  };

  return (

    <div className="grid gap-4">

      {/* VALUE */}
      <div>

        <Label>Valor <span className="text-red-400">*</span></Label>

        <Input
          value={form.value || ""}
          onChange={(e) =>
            handleChange(
              "value",
              e.target.value
            )
          }
          placeholder="Ej: Rojo, XL, Algodón..."
          maxLength={20}
          aria-invalid={!!errors.value}
        />
        {errors.value && <p className="text-xs text-destructive">{errors.value}</p>}

      </div>

      {/* ATTRIBUTE */}
      <div>

        <Label>Atributo <span className="text-red-400">*</span></Label>

        <select
          className={`w-full border rounded-md h-10 px-3 bg-background transition-colors ${
            errors.attributeId ? "border-destructive ring-1 ring-destructive/20" : ""
          }`}
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
        {errors.attributeId && <p className="text-xs text-destructive">{errors.attributeId}</p>}

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
          onClick={handleSubmit}
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