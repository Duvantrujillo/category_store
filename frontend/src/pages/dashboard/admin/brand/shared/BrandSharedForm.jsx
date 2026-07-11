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
  { id: 2, label: "Media" },
];

export default function BrandSharedForm({
  mode = "create",
  form,
  handleChange,
  loading,
  onCancel,
  onSubmit,
}) {
  const isEdit = mode === "edit";
  const [step, setStep] = useState(1);
  const [attempted, setAttempted] = useState({});

  // Mismas reglas que valida el backend (brand.controller.js).
  const getInfoErrors = () => {
    const errors = {};
    const name = (form.name || "").trim();
    if (!name) errors.name = "El nombre es obligatorio";
    else if (name.length > 25) errors.name = "El nombre no puede superar 25 caracteres";
    return errors;
  };

  const getMediaErrors = () => {
    const errors = {};
    if (!form.preview) errors.logo = "El logo es obligatorio";
    if (form.description && form.description.length > 800) {
      errors.description = "La descripción no puede superar 800 caracteres";
    }
    return errors;
  };

  const STEP_ERROR_GETTERS = { 1: getInfoErrors, 2: getMediaErrors };
  const getStepErrors = (n) => STEP_ERROR_GETTERS[n]?.() ?? {};
  const isStepValid = (n) => Object.keys(getStepErrors(n)).length === 0;
  const currentStepValid = isStepValid(step);
  const currentStepErrors = attempted[step] ? getStepErrors(step) : {};

  const goToStep = (target) => {
    if (target <= step) { setStep(target); return; }
    for (let s = step; s < target; s++) {
      if (!isStepValid(s)) {
        setAttempted((prev) => ({ ...prev, [s]: true }));
        return;
      }
    }
    setStep(target);
  };

  const handleSubmit = () => {
    if (!currentStepValid) {
      setAttempted((prev) => ({ ...prev, [step]: true }));
      return;
    }
    onSubmit();
  };

  return (
    <div className="grid gap-4">

      {/* Stepper */}
      <Stepper value={step} onValueChange={goToStep} className="w-full mb-2">
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
        <InfoSection form={form} handleChange={handleChange} errors={currentStepErrors} />
      )}

      {/* Paso 2 — Media */}
      {step === 2 && (
        <MediaSection form={form} handleChange={handleChange} errors={currentStepErrors} />
      )}

      {/* Navegación */}
      <div className="flex justify-between pt-4 border-t">

        <Button
          type="button"
          variant="outline"
          disabled={step === 1}
          onClick={() => goToStep(step - 1)}
          className="border-slate-300 hover:bg-slate-100"
        >
          Anterior
        </Button>

        {step < STEPS.length ? (
          <Button
            type="button"
            onClick={() => goToStep(step + 1)}
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
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading
                ? isEdit ? "Guardando..." : "Creando..."
                : isEdit ? "Guardar cambios" : "Crear marca"}
            </Button>
          </div>
        )}

      </div>

    </div>
  );
}
