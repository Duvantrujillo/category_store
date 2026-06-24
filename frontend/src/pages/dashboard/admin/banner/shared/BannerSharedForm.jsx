import { useState } from "react";
import { Button } from "@/components/ui/button";
import InfoSection from "./sections/InfoSection";
import MediaSection from "./sections/MediaSection";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTrigger,
} from "@/components/reui/stepper";

const STEPS = [
  { id: 1, label: "Información" },
  { id: 2, label: "Imagen" },
];

export default function BannerSharedForm({
  mode = "create",
  form,
  handleChange,
  loading,
  onCancel,
  onSubmit,
}) {
  const isEdit = mode === "edit";
  const [step, setStep] = useState(1);

  return (
    <div className="grid gap-4">

      {/* Stepper */}
      <Stepper value={step} onValueChange={setStep} className="w-full mb-2">
        <StepperNav>
          {STEPS.map((s) => (
            <StepperItem key={s.id} step={s.id}>
              <StepperTrigger>
                <StepperIndicator
                  className="
                    data-[state=active]:bg-blue-600    data-[state=active]:text-white
                    data-[state=completed]:bg-blue-600 data-[state=completed]:text-white
                    data-[state=inactive]:bg-muted     data-[state=inactive]:text-muted-foreground
                  "
                >
                  {s.id}
                </StepperIndicator>
              </StepperTrigger>
              {s.id < STEPS.length && (
                <StepperSeparator className="group-data-[state=completed]/step:bg-blue-600" />
              )}
            </StepperItem>
          ))}
        </StepperNav>
      </Stepper>

      {/* Paso 1 — Información */}
      {step === 1 && (
        <InfoSection form={form} handleChange={handleChange} />
      )}

      {/* Paso 2 — Imagen */}
      {step === 2 && (
        <MediaSection form={form} handleChange={handleChange} />
      )}

      {/* Navegación */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          disabled={step === 1}
          onClick={() => setStep((p) => p - 1)}
          className="border-slate-300 hover:bg-slate-100"
        >
          Anterior
        </Button>

        {step < STEPS.length ? (
          <Button
            type="button"
            onClick={() => setStep((p) => p + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Siguiente
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={onCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading
                ? isEdit ? "Guardando..." : "Creando..."
                : isEdit ? "Guardar cambios" : "Crear banner"}
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
