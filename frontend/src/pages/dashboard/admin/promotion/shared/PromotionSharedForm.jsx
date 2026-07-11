import { useState } from "react";
import { Button } from "@/components/ui/button";
import InfoSection from "./sections/InfoSection";
import LimitsSection from "./sections/LimitsSection";
import ScopeSection from "./sections/ScopeSection";
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
  { id: 3, label: "Alcance" },
];

export default function PromotionSharedForm({
  mode = "create",
  form,
  handleChange,
  loading,
  onCancel,
  onSubmit,
  products = [],
  categories = [],
  brands = [],
  variants = [],
}) {
  const isEdit = mode === "edit";
  const [step, setStep] = useState(1);
  // Qué pasos ya intentaron avanzar al menos una vez — recién ahí se
  // muestran los mensajes de error en los campos (no antes de que el
  // usuario interactúe con el paso).
  const [attempted, setAttempted] = useState({});

  // Mismas reglas que valida el backend (validateFields/validateScope en
  // promotion.controller.js), pero devolviendo el detalle por campo para
  // poder mostrar el mensaje justo debajo del input correspondiente.
  const getInfoErrors = () => {
    const errors = {};
    if (!(form.name || "").trim()) errors.name = "El nombre es obligatorio";
    if (!form.type) errors.type = "Selecciona un tipo de promoción";

    const numericValue = Number(form.value);
    if (form.value === undefined || form.value === null || form.value === "" || isNaN(numericValue) || numericValue <= 0) {
      errors.value = form.type === "PERCENTAGE"
        ? "Ingresa un porcentaje válido mayor a 0"
        : "Ingresa un monto válido mayor a 0";
    } else if (form.type === "PERCENTAGE" && numericValue > 100) {
      errors.value = "El porcentaje no puede ser mayor a 100";
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

  const getScopeErrors = () => {
    const errors = {};
    const scope = form.scope || "ALL_PRODUCTS";
    if (scope === "PRODUCTS" && (form.productIds || []).length === 0) {
      errors.productIds = "Selecciona al menos un producto";
    }
    if (scope === "CATEGORIES" && (form.categoryIds || []).length === 0) {
      errors.categoryIds = "Selecciona al menos una categoría";
    }
    if (scope === "BRANDS" && (form.brandIds || []).length === 0) {
      errors.brandIds = "Selecciona al menos una marca";
    }
    return errors;
  };

  const STEP_ERROR_GETTERS = { 1: getInfoErrors, 2: getLimitsErrors, 3: getScopeErrors };
  const getStepErrors = (n) => STEP_ERROR_GETTERS[n]?.() ?? {};
  const isStepValid = (n) => Object.keys(getStepErrors(n)).length === 0;
  const currentStepValid = isStepValid(step);
  const currentStepErrors = attempted[step] ? getStepErrors(step) : {};

  // Ir hacia atrás siempre se permite. Ir hacia adelante (ya sea con
  // "Siguiente" o clickeando directo un número del stepper) solo si todos
  // los pasos entre el actual y el destino están completos — si no, se
  // marca ese paso como "intentado" para que se vean sus errores.
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
        <InfoSection form={form} handleChange={handleChange} errors={currentStepErrors} />
      )}

      {/* Paso 2 — Vigencia y límites */}
      {step === 2 && (
        <LimitsSection form={form} handleChange={handleChange} errors={currentStepErrors} />
      )}

      {/* Paso 3 — Alcance */}
      {step === 3 && (
        <ScopeSection
          form={form}
          handleChange={handleChange}
          products={products}
          categories={categories}
          brands={brands}
          variants={variants}
          errors={currentStepErrors}
        />
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
                : isEdit ? "Guardar cambios" : "Crear promoción"}
            </Button>
          </div>
        )}

      </div>

    </div>
  );
}
