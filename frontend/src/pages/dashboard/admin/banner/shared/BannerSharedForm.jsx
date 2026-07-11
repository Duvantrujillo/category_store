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
  const [attempted, setAttempted] = useState({});

  // Mismas reglas que valida el backend (banner.controller.js), devueltas
  // por campo para mostrar el mensaje justo debajo del input.
  const getInfoErrors = () => {
    const errors = {};
    if (!(form.title || "").trim()) errors.title = "El título es obligatorio";
    else if (form.title.trim().length > 40) errors.title = "El título no puede superar 40 caracteres";

    if (form.link && form.link.trim().length > 2048) {
      errors.link = "El enlace no puede superar 2048 caracteres";
    }

    if (!form.startDate) errors.startDate = "La fecha de inicio es obligatoria";
    if (!form.endDate) errors.endDate = "La fecha de fin es obligatoria";

    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (isNaN(start.getTime())) errors.startDate = "Fecha de inicio inválida";
      else if (isNaN(end.getTime())) errors.endDate = "Fecha de fin inválida";
      else if (start >= end) errors.endDate = "Debe ser posterior a la fecha de inicio";
    }
    return errors;
  };

  const getMediaErrors = () => {
    const errors = {};
    if (!form.preview) errors.image = "La imagen es obligatoria";
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

      {/* Paso 2 — Imagen */}
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
                : isEdit ? "Guardar cambios" : "Crear banner"}
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
