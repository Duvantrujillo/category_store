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

                {/* LOGO */}
                <div className="flex flex-col gap-2">
                    <Label>Logo</Label>

                    <div className="flex items-center gap-3">
                        {/* BOTÓN AZUL PARA SUBIR ARCHIVO */}
                        <div className="relative">
                            <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Subir Logo
                            </Button>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    handleChange("logo", file);
                                    handleChange("preview", URL.createObjectURL(file));
                                }}
                            />
                        </div>

                        {/* PREVIEW DEL LOGO */}
                        {form.preview && (
                            <img
                                src={
                                    form.preview.startsWith("/uploads")
                                        ? `${import.meta.env.VITE_API_URL}${form.preview}`
                                        : form.preview
                                }
                                alt="Preview"
                                className="h-10 w-10 rounded-md object-cover border"
                            />
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 px-3 py-3">

                {/* TEXTO */}
                <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Estado</Label>
                    <p className="text-xs text-muted-foreground">
                        Activo / inactivo
                    </p>
                </div>

                {/* SELECT MÁS CERCANO */}
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
                            : "Crear marca"}

                </Button>

            </div>

        </div>

    );

}