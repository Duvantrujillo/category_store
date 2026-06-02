import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductSharedForm({
  mode = "create",
  form,
  handleChange,
  loading,
  onCancel,
  onSubmit,
  categories = [],
  brands = [],
}) {
  const isEdit = mode === "edit";

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida");
      return;
    }

    handleChange("mainImage", file);
    handleChange("preview", URL.createObjectURL(file));
  };

  const isFormValid = () => {
    return form.name && form.categoryId && form.status;
  };

  return (
    <div className="grid gap-4">

      {/* NAME */}
      <div className="grid gap-2">
        <Label htmlFor="name" className="font-semibold text-sm">
          Nombre del Producto *
        </Label>
        <Input
          id="name"
          value={form.name || ""}
          onChange={(e) =>
            handleChange("name", e.target.value)
          }
          placeholder="Ej: Laptop Dell XPS"
          className="h-9"
        />
      </div>

      {/* SHORT DESCRIPTION & IMAGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="shortDescription" className="font-semibold text-sm">
            Descripción Corta
          </Label>
          <Input
            id="shortDescription"
            value={form.shortDescription || ""}
            onChange={(e) =>
              handleChange("shortDescription", e.target.value)
            }
            placeholder="Breve descripción"
            className="h-9"
          />
          <p className="text-xs text-muted-foreground">
            Opcional
          </p>
        </div>

        {/* IMAGE */}
        <div className="grid gap-2">
          <Label htmlFor="image" className="font-semibold text-sm">
            Imagen Principal
          </Label>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white h-9"
                type="button"
              >
                Subir imagen
              </Button>
              <input
                id="image"
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageChange}
              />
            </div>
            {form.preview && (
              <img
                src={
                  form.preview.startsWith("/uploads")
                    ? `${import.meta.env.VITE_API_URL}${form.preview}`
                    : form.preview
                }
                alt="Vista previa"
                className="h-9 w-9 rounded object-cover border"
              />
            )}
          </div>
        </div>
      </div>

      {/* CATEGORY & BRAND & STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* CATEGORY */}
        <div className="grid gap-2">
          <Label htmlFor="category" className="font-semibold text-sm">
            Categoría *
          </Label>
          <Select
            value={String(form.categoryId) || ""}
            onValueChange={(val) =>
              handleChange("categoryId", val)
            }
          >
            <SelectTrigger id="category" className="h-9 text-sm">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  Sin categorías
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* BRAND */}
        <div className="grid gap-2">
          <Label htmlFor="brand" className="font-semibold text-sm">
            Marca
          </Label>
          <Select
            value={String(form.brandId) || ""}
            onValueChange={(val) =>
              handleChange("brandId", val)
            }
          >
            <SelectTrigger id="brand" className="h-9 text-sm">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {brands && brands.length > 0 ? (
                brands.map((brand) => (
                  <SelectItem key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  Sin marcas
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* STATUS */}
        <div className="grid gap-2">
          <Label htmlFor="status" className="font-semibold text-sm">
            Estado *
          </Label>
          <Select
            value={form.status || "DRAFT"}
            onValueChange={(val) =>
              handleChange("status", val)
            }
          >
            <SelectTrigger id="status" className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Borrador</span>
                </div>
              </SelectItem>
              <SelectItem value="ACTIVE">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Activo</span>
                </div>
              </SelectItem>
              <SelectItem value="INACTIVE">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Inactivo</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="grid gap-2">
        <Label htmlFor="description" className="font-semibold text-sm">
          Descripción Completa
        </Label>
        <Textarea
          id="description"
          value={form.description || ""}
          onChange={(e) =>
            handleChange("description", e.target.value)
          }
          placeholder="Detalles del producto"
          className="min-h-20 resize-none text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Opcional
        </p>
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          size="sm"
          className="text-sm"
        >
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          disabled={loading || !isFormValid()}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white text-sm"
        >
          {loading
            ? isEdit
              ? "Guardando..."
              : "Creando..."
            : isEdit
              ? "Guardar"
              : "Crear"}
        </Button>
      </div>
    </div>
  );
}