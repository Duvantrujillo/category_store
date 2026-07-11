import { ImageUp, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";

export default function MediaSection({ form, handleChange, errors = {} }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0];
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
    <div className="space-y-6">

      <div>
        <h3 className="text-sm font-semibold">Media y descripción</h3>
        <p className="text-xs text-muted-foreground">Imagen principal del combo y texto descriptivo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Imagen dropzone */}
        <div className="space-y-1.5">
          <Label>Imagen principal</Label>

          {previewSrc ? (
            <div className="relative flex items-center justify-center rounded-xl border border-slate-200 bg-white overflow-hidden h-44"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)",
                backgroundSize: "16px 16px",
              }}
            >
              <img
                src={previewSrc}
                alt="Preview"
                className="max-h-32 max-w-[75%] w-auto object-contain drop-shadow-sm"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => { handleChange("mainImage", null); handleChange("preview", null); }}
              >
                <X size={13} />
              </Button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center gap-3 h-44 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                isDragActive
                  ? "border-indigo-400 bg-indigo-50/60"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
                <ImageUp size={18} className="text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600">
                  {isDragActive ? "Suelta el archivo aquí" : "Arrastra la imagen aquí"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">o haz clic para seleccionarla</p>
              </div>
            </div>
          )}
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
            placeholder="Describe brevemente el combo..."
            className="h-44 resize-none"
            maxLength={800}
            aria-invalid={!!errors.description}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
        </div>

      </div>

    </div>
  );
}
