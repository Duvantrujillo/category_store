import { ImageUp, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";

const API = import.meta.env.VITE_API_URL;

export default function MediaSection({ form, handleChange }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0];
      if (!file) return;
      handleChange("image",   file);
      handleChange("preview", URL.createObjectURL(file));
    },
  });

  const previewSrc = form.preview
    ? form.preview.startsWith("/uploads")
      ? `${API}${form.preview}`
      : form.preview
    : null;

  return (
    <div className="space-y-6">

      <div>
        <h3 className="text-sm font-semibold">Imagen del banner</h3>
        <p className="text-xs text-muted-foreground">Sube la imagen que aparecerá en el hero. JPG, PNG o WebP · máx. 2 MB.</p>
      </div>

      <div className="space-y-1.5">
        <Label>Imagen <span className="text-red-400">*</span></Label>

        {previewSrc ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img
              src={previewSrc}
              alt="Preview banner"
              className="w-full h-52 object-cover"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={() => { handleChange("image", null); handleChange("preview", null); }}
            >
              <X size={13} />
            </Button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center gap-3 h-52 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
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

    </div>
  );
}
