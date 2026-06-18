import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

  const previewSrc = form.preview
    ? form.preview.startsWith("/uploads")
      ? `${import.meta.env.VITE_API_URL}${form.preview}`
      : form.preview
    : null;

  return (
    <div className="space-y-4">

      <div>
        <h3 className="text-sm font-semibold">Imagen y descripción</h3>
        <p className="text-xs text-muted-foreground">
          Imagen de portada y texto visible en la tienda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Imagen principal */}
        <div className="space-y-1.5">
          <Label>Imagen principal</Label>

          {previewSrc ? (
            <div className="relative flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden h-44">
              <img
                src={previewSrc}
                alt="preview"
                className="h-full w-full object-cover"
              />
              <div
                {...getRootProps()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-xl"
              >
                <input {...getInputProps()} />
                <p className="text-white text-xs font-medium">Cambiar imagen</p>
              </div>
              <button
                type="button"
                className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow hover:bg-destructive/90"
                onClick={() => { handleChange("mainImage", null); handleChange("preview", null); }}
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center gap-3 h-44 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-400 bg-blue-50/60"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
                <ImagePlus className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600">
                  {isDragActive ? "Suelta aquí" : "Arrastra la imagen aquí"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  o haz clic · PNG, JPG, WEBP
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={form.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Detalles, características, especificaciones..."
            className="h-44 resize-none text-sm"
          />
        </div>

      </div>

    </div>
  );
}
