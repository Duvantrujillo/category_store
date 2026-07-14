import { useState } from "react";
import { Button } from "@/components/ui/button";
import InfoSection from "./sections/InfoSection";
import LimitsSection from "./sections/LimitsSection";
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
  { id: 2, label: "Vigencia y límites" },
];

export default function PurchaseGiftSharedForm({
  mode = "create",
  form,
  handleChange,
  loading,
  onCancel,
  onSubmit,
  variants = [],
}) {
  const isEdit = mode === "edit";
  const [step, setStep] = useState(1);
  // Qué pasos ya intentaron avanzar al menos una vez — recién ahí se
  // muestran los mensajes de error en los campos.
  const [attempted, setAttempted] = useState({});

  // Mismas reglas que valida el backend (validateFields en
  // purchase-gift.controller.js), pero devolviendo el detalle por campo.
  const getInfoErrors = () => {
    const errors = {};
    if (!(form.name || "").trim()) errors.name = "El nombre es obligatorio";

    const numericMinPurchase = Number(form.minimumPurchase);
    if (form.minimumPurchase === undefined || form.minimumPurchase === null || form.minimumPurchase === "" || isNaN(numericMinPurchase) || numericMinPurchase <= 0) {
      errors.minimumPurchase = "Ingresa un monto mínimo válido mayor a 0";
    }

    if (!form.productVariantId) {
      errors.productVariantId = "Selecciona el producto que se va a obsequiar";
    }
    return errors;
  };

  const getLimitsErrors = () => {
    const errors = {};
    if (!form.startsAt) errors.startsAt = "La fecha de inicio es obligatoria";
    if (!form.expiresAt) errors.expiresAt = "La fecha de expiración es obligatoria";

    if (form.startsAt && form.expiresAt) {
      const start = new Date(form.startsAt);
      const end = new Date(form.expiresAt);
      if (isNaN(start.getTime())) errors.startsAt = "Fecha de inicio inválida";
      else if (isNaN(end.getTime())) errors.expiresAt = "Fecha de expiración inválida";
      else if (start >= end) errors.expiresAt = "Debe ser posterior a la fecha de inicio";
    }
    return errors;
  };

  const STEP_ERROR_GETTERS = { 1: getInfoErrors, 2: getLimitsErrors };
  const getStepErrors = (n) => STEP_ERROR_GETTERS[n]?.() ?? {};
  const isStepValid = (n) => Object.keys(getStepErrors(n)).length === 0;
  const currentStepValid = isStepValid(step);
  const currentStepErrors = attempted[step] ? getStepErrors(step) : {};

  // Ir hacia atrás siempre se permite. Ir hacia adelante solo si todos los
  // pasos entre el actual y el destino están completos.
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
                    data-[state=active]:bg-indigo-600    data-[state=active]:text-white
                    data-[state=completed]:bg-indigo-600 data-[state=completed]:text-white
                    data-[state=inactive]:bg-muted       data-[state=inactive]:text-muted-foreground
                  "
                >
                  {s.id}
                </StepperIndicator>
              </StepperTrigger>
              {s.id < STEPS.length && (
                <StepperSeparator className="group-data-[state=completed]/step:bg-indigo-600" />
              )}
            </StepperItem>
          ))}
        </StepperNav>
      </Stepper>

      {/* Paso 1 — Información */}
      {step === 1 && (
        <InfoSection form={form} handleChange={handleChange} variants={variants} errors={currentStepErrors} />
      )}

      {/* Paso 2 — Vigencia y límites */}
      {step === 2 && (
        <LimitsSection form={form} handleChange={handleChange} errors={currentStepErrors} />
      )}

      {/* Navegación */}
      <div className="flex justify-between pt-4 border-t">

        <Button
          type="button"
          variant="outline"
          disabled={step === 1}
          onClick={() => goToStep(step - 1)}
        >
          Anterior
        </Button>

        {step < STEPS.length ? (
          <Button type="button" onClick={() => goToStep(step + 1)}>
            Siguiente
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading
                ? isEdit ? "Guardando..." : "Creando..."
                : isEdit ? "Guardar cambios" : "Crear regalo"}
            </Button>
          </div>
        )}

      </div>

    </div>
  );
}
