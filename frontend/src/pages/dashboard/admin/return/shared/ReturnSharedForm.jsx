import { useState } from "react";
import { Button } from "@/components/ui/button";

import BasicInfoSection from "./sections/BasicInfoSection";
import ItemsSection from "./sections/ItemsSection";

import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTrigger,
} from "@/components/reui/stepper";

const STEPS = [
  { id: 1, label: "Info básica" },
  { id: 2, label: "Productos" },
];

export default function ReturnSharedForm({
  mode = "create",
  form,
  handleChange,
  loading,
  onCancel,
  onSubmit,
  orders = [],
  orderItems = [],
  existingItems = [],
  currentStatus,
}) {
  const isEdit = mode === "edit";
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const wrappedChange = (field, value) => {
    handleChange(field, value);
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateStep1 = () => {
    const e = {};
    if (!isEdit && !form.orderId)            e.orderId    = "Debes seleccionar una orden";
    if (!form.resolution)                    e.resolution = "Debes seleccionar una resolución";
    if (!form.reason?.trim())                e.reason     = "Debes ingresar el motivo de la devolución";
    else if (form.reason.trim().length > 300) e.reason    = "El motivo no puede superar los 300 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    if (!form.selectedItems?.length) {
      setErrors({ selectedItems: "Debes seleccionar al menos un producto para devolver" });
      return false;
    }
    return true;
  };

  const handleStepChange = (newStep) => {
    if (newStep > step && step === 1 && !validateStep1()) return;
    setErrors({});
    setStep(newStep);
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setErrors({});
    setStep((p) => p + 1);
  };

  const handleSubmit = () => {
    if (!isEdit && !validateStep2()) return;
    onSubmit();
  };

  return (
    <div className="grid gap-4">

      {/* STEPPER */}
      <Stepper value={step} onValueChange={handleStepChange} className="w-full mb-4">
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

      {/* PASO 1 – Info básica */}
      {step === 1 && (
        <BasicInfoSection
          mode={mode}
          form={form}
          handleChange={wrappedChange}
          orders={orders}
          errors={errors}
          currentStatus={currentStatus}
        />
      )}

      {/* PASO 2 – Productos */}
      {step === 2 && (
        <ItemsSection
          mode={mode}
          form={form}
          handleChange={wrappedChange}
          orderItems={orderItems}
          existingItems={existingItems}
          errors={errors}
        />
      )}

      {/* NAVEGACIÓN */}
      <div className="flex justify-between pt-4 border-t">

        <Button
          type="button"
          variant="outline"
          disabled={step === 1}
          onClick={() => { setErrors({}); setStep((p) => p - 1); }}
          className="border-slate-300 hover:bg-slate-100"
        >
          Anterior
        </Button>

        {step < STEPS.length ? (
          <Button
            type="button"
            onClick={handleNext}
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
                : isEdit ? "Guardar cambios" : "Crear solicitud"}
            </Button>
          </div>
        )}

      </div>

    </div>
  );
}
