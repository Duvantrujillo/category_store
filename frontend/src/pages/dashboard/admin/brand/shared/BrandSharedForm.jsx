import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";

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

    const {
        getRootProps,
        getInputProps,
    } = useDropzone({
        accept: {
            "image/*": [],
        },
        maxFiles: 1,
        onDrop: (acceptedFiles) => {

            const file = acceptedFiles[0];

            if (!file) return;

            handleChange("logo", file);

            handleChange(
                "preview",
                URL.createObjectURL(file)
            );

        },
    });

    return (

        <div className="grid gap-6">

            {/* PRODUCTO */}
            <div className="grid gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    PRODUCTO
                </div>
                <div className="grid gap-2">
                    <Label>Nombre</Label>
                    <Input
                        value={form.name || ""}
                        onChange={(e) =>
                            handleChange(
                                "name",
                                e.target.value
                            )
                        }
                        placeholder="Nombre de la marca"
                    />
                </div>
            </div>

            {/* MEDIA */}
            <div className="grid gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    MEDIA
                </div>
                <div className="space-y-2">
                    <Label>Logo</Label>
                    <div
                        {...getRootProps()}
                        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:bg-muted/50"
                    >
                        <input {...getInputProps()} />
                        {form.preview ? (
                            <div className="flex justify-center">
                                <div className="relative inline-block">
                                    <img
                                        src={
                                            form.preview.startsWith("/uploads")
                                                ? `${import.meta.env.VITE_API_URL}${form.preview}`
                                                : form.preview
                                        }
                                        alt="Preview"
                                        className="h-28 w-28 rounded-xl border object-cover"
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        className="absolute -top-2 -right-2 h-7 w-7"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleChange("logo", null);
                                            handleChange("preview", null);
                                        }}
                                    >
                                        ×
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="font-medium">Arrastra el logo aquí</p>
                                <p className="text-sm text-muted-foreground">
                                    o haz clic para seleccionarlo
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DETALLES */}
            <div className="grid gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    DETALLES
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 px-3 py-3">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Estado</Label>
                        <p className="text-xs text-muted-foreground">Activo / inactivo</p>
                    </div>
                    <Select
                        value={form.isActive ? "true" : "false"}
                        onValueChange={(value) =>
                            handleChange("isActive", value === "true")
                        }
                    >
                        <SelectTrigger className="h-9 w-32 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">
                                <span className="font-medium text-green-600">Activo</span>
                            </SelectItem>
                            <SelectItem value="false">
                                <span className="font-medium text-red-600">Inactivo</span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="grid gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    DESCRIPCIÓN
                </div>
                <div className="grid gap-2">
                    <Label>Descripción</Label>
                    <textarea
                        className="w-full min-h-24 border rounded-md px-3 py-2 bg-background"
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
            </div>

            {/* ACCIONES */}
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button onClick={onSubmit} disabled={loading}>
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