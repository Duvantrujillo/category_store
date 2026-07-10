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
        <InfoSection form={form} handleChange={handleChange} />
      )}

      {/* Paso 2 — Vigencia y límites */}
      {step === 2 && (
        <LimitsSection form={form} handleChange={handleChange} />
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
        />
      )}

      {/* Navegación */}
      <div className="flex justify-between pt-4 border-t">

        <Button
          type="button"
          variant="outline"
          disabled={step === 1}
          onClick={() => setStep((p) => p - 1)}
        >
          Anterior
        </Button>

        {step < STEPS.length ? (
          <Button type="button" onClick={() => setStep((p) => p + 1)}>
            Siguiente
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="button" onClick={onSubmit} disabled={loading}>
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
