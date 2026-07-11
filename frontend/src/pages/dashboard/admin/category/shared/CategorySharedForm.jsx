import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDropzone } from "react-dropzone";
import { ImageUp, X } from "lucide-react";

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
  const [attempted, setAttempted] = useState(false);

  // Mismas reglas que valida el backend (category.controller.js).
  const getErrors = () => {
    const errors = {};
    const name = (form.name || "").trim();
    if (!name) errors.name = "El nombre es obligatorio";
    else if (name.length > 30) errors.name = "El nombre no puede superar 30 caracteres";

    if (form.description && form.description.length > 1500) {
      errors.description = "La descripción no puede superar 1500 caracteres";
    }

    if (!form.preview) errors.image = "La imagen es obligatoria";
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0];
      if (!file) return;
      handleChange("image", file);
      handleChange("preview", URL.createObjectURL(file));
    },
  });

  const previewSrc = form.preview
    ? form.preview.startsWith("/uploads")
      ? `${import.meta.env.VITE_API_URL}${form.preview}`
      : form.preview
    : null;

  return (
    <div className="grid gap-4">

      {/* Imagen */}
      <div className="space-y-1.5">
        <Label>Imagen <span className="text-red-400">*</span></Label>

        {previewSrc ? (
          <div
            className="relative flex items-center justify-center rounded-xl border border-slate-200 bg-white overflow-hidden h-36"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
              backgroundSize: "16px 16px",
            }}
          >
            <img
              src={previewSrc}
              alt="Preview"
              className="max-h-24 max-w-[75%] w-auto object-contain drop-shadow-sm"
            />
            <button
              type="button"
              className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow hover:opacity-90"
              onClick={() => { handleChange("image", null); handleChange("preview", null); }}
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center gap-2 h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
              isDragActive
                ? "border-indigo-400 bg-indigo-50/60"
                : errors.image
                ? "border-destructive/60 hover:border-destructive"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100">
              <ImageUp size={16} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">
                {isDragActive ? "Suelta aquí" : "Arrastra la imagen aquí"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">o haz clic para seleccionarla</p>
            </div>
          </div>
        )}
        {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
      </div>

      {/* Nombre + Estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Nombre <span className="text-red-400">*</span></Label>
          <Input
            value={form.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nombre de la categoría"
            maxLength={30}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Estado</Label>
          <Select
            value={form.isActive ? "true" : "false"}
            onValueChange={(val) => handleChange("isActive", val === "true")}
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

      {/* Descripción */}
      <div className="space-y-1.5">
        <Label>
          Descripción{" "}
          <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
        </Label>
        <Textarea
          value={form.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Descripción de la categoría"
          className="resize-none min-h-20"
          maxLength={1500}
          aria-invalid={!!errors.description}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>

      {/* Orden + Categoría padre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Orden</Label>
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) => handleChange("sortOrder", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Categoría Padre</Label>
          <select
            className="w-full border rounded-md h-10 px-3 bg-background text-sm"
            value={form.parentId != null ? String(form.parentId) : ""}
            onChange={(e) => handleChange("parentId", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Sin categoría padre</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="button" onClick={handleSubmit} disabled={loading}>
          {loading
            ? isEdit ? "Guardando..." : "Creando..."
            : isEdit ? "Guardar cambios" : "Crear categoría"}
        </Button>
      </div>

    </div>
  );
}
