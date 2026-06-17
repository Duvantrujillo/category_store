import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useDropzone } from "react-dropzone";
import { ImagePlus, X } from "lucide-react";

export default function ContentSection({ form, handleChange }) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "image/*": [] },
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (!file) return;
            handleChange("mainImage", file);
            handleChange("preview", URL.createObjectURL(file));
        },
    });

    return (
        <div className="space-y-6">

            <section className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold">Imagen Principal</h3>
                    <p className="text-xs text-muted-foreground">
                        Imagen de portada del producto. Recomendado: 800×800px.
                    </p>
                </div>

                {form.preview ? (
                    <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                            <img
                                src={
                                    form.preview.startsWith("/uploads")
                                        ? `${import.meta.env.VITE_API_URL}${form.preview}`
                                        : form.preview
                                }
                                alt="preview"
                                className="w-36 h-36 object-cover rounded-xl border"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    handleChange("mainImage", null);
                                    handleChange("preview", null);
                                }}
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div
                            {...getRootProps()}
                            className="flex-1 border-2 border-dashed rounded-xl p-4 cursor-pointer text-center hover:bg-muted/50 transition-colors text-sm text-muted-foreground"
                        >
                            <input {...getInputProps()} />
                            <p>Haz clic o arrastra para reemplazar</p>
                        </div>
                    </div>
                ) : (
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-8 cursor-pointer text-center transition-colors ${
                            isDragActive
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                : "hover:bg-muted/50"
                        }`}
                    >
                        <input {...getInputProps()} />
                        <div className="space-y-2">
                            <div className="flex justify-center">
                                <div className="p-3 rounded-full bg-muted">
                                    <ImagePlus className="w-6 h-6 text-muted-foreground" />
                                </div>
                            </div>
                            <p className="font-medium text-sm">
                                {isDragActive ? "Suelta la imagen aquí" : "Arrastra una imagen aquí"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                o haz clic para seleccionarla · PNG, JPG, WEBP
                            </p>
                        </div>
                    </div>
                )}
            </section>

            <section className="space-y-4 border-t pt-4">
                <div>
                    <h3 className="text-sm font-semibold">Descripción</h3>
                    <p className="text-xs text-muted-foreground">
                        Texto que verán los clientes en la tienda.
                    </p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="shortDescription">Descripción Corta</Label>
                    <Input
                        id="shortDescription"
                        value={form.shortDescription || ""}
                        onChange={(e) => handleChange("shortDescription", e.target.value)}
                        placeholder="Resumen breve del producto"
                        maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                        {(form.shortDescription || "").length}/160
                    </p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Descripción Completa</Label>
                    <Textarea
                        id="description"
                        value={form.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Detalles, características, especificaciones..."
                        className="min-h-28 resize-none text-sm"
                    />
                </div>
            </section>

        </div>
    );
}
