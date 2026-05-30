import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BrandSharedForm({
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
                    placeholder="Nombre de la marca"
                />

            </div>

            {/* DESCRIPTION */}
            <div>

                <Label>Descripción</Label>

                <textarea
                    className="
            w-full
            min-h-24
            border
            rounded-md
            px-3
            py-2
            bg-background
          "
                    value={form.description || ""}
                    onChange={(e) =>
                        handleChange(
                            "description",
                            e.target.value
                        )
                    }
                    placeholder="Descripción de la marca"
                />

            </div>

          <div>

  <Label>Logo</Label>

  <Input
    type="file"
    accept="image/*"
    onChange={(e) => {

      const file =
        e.target.files?.[0];

      if (!file) return;

      handleChange("logo", file);

      handleChange(
        "preview",
        URL.createObjectURL(file)
      );

    }}
  />

  {form.preview && (

    <img
      src={
        form.preview.startsWith("/uploads")
          ? `${import.meta.env.VITE_API_URL}${form.preview}`
          : form.preview
      }
      alt="Preview"
      className="
        mt-3
        h-24
        w-24
        rounded-lg
        object-cover
        border
      "
    />

  )}

</div>

            {/* IS ACTIVE */}
            <div className="flex items-center justify-between border rounded-lg p-3">

                <div className="space-y-1">

                    <Label>Estado</Label>

                    <p className="text-sm text-muted-foreground">
                        Activar o desactivar marca
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
                    value={
                        form.isActive
                            ? "true"
                            : "false"
                    }
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
                            : "Crear marca"}

                </Button>

            </div>

        </div>

    );

}