import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Stepper,
    StepperIndicator,
    StepperItem,
    StepperNav,
    StepperSeparator,
    StepperTrigger,
} from "@/components/reui/stepper";

import InfoSection from "./sections/InfoSection";
import ContentSection from "./sections/ContentSection";

const STEPS = [
    { id: 1, label: "Información" },
    { id: 2, label: "Contenido" },
];

export default function ProductSharedForm({
    mode = "create",
    form,
    handleChange,
    loading,
    onCancel,
    onSubmit,
    categories = [],
    brands = [],
}) {
    const isEdit = mode === "edit";
    const [step, setStep] = useState(1);
    const [attempted, setAttempted] = useState({});

    // Mismas reglas que valida el backend (product.controller.js).
    const getInfoErrors = () => {
        const errors = {};
        const name = (form.name || "").trim();
        if (!name) errors.name = "El nombre es obligatorio";
        else if (name.length > 50) errors.name = "El nombre no puede superar 50 caracteres";

        if (!form.categoryId) errors.categoryId = "La categoría es obligatoria";
        return errors;
    };

    const getContentErrors = () => {
        const errors = {};
        if (form.description && form.description.length > 3000) {
            errors.description = "La descripción no puede superar 3000 caracteres";
        }
        return errors;
    };

    const STEP_ERROR_GETTERS = { 1: getInfoErrors, 2: getContentErrors };
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

            <Stepper value={step} onValueChange={goToStep} className="w-full mb-2">
                <StepperNav>
                    {STEPS.map((s) => (
                        <StepperItem key={s.id} step={s.id}>
                            <StepperTrigger>
                                <StepperIndicator
                                    className="
                                        data-[state=active]:bg-blue-600 data-[state=active]:text-white
                                        data-[state=completed]:bg-blue-600 data-[state=completed]:text-white
                                        data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground
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

            {step === 1 && (
                <InfoSection
                    form={form}
                    handleChange={handleChange}
                    categories={categories}
                    brands={brands}
                    errors={currentStepErrors}
                />
            )}

            {step === 2 && (
                <ContentSection
                    form={form}
                    handleChange={handleChange}
                    errors={currentStepErrors}
                />
            )}

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
                                : isEdit ? "Guardar cambios" : "Crear producto"}
                        </Button>
                    </div>
                )}

            </div>

        </div>
    );
}
