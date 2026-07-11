import { useState } from "react";
import { Button } from "@/components/ui/button";

import BasicInfoSection from "./sections/BasicInfoSection";
import AttributeSection from "./sections/AttributeSection";
import ImagesSection from "./sections/ImagesSection";
import {
    Stepper,
    StepperIndicator,
    StepperItem,
    StepperNav,
    StepperSeparator,
    StepperTrigger,
} from "@/components/reui/stepper";
export default function ProductVariantSharedForm({
    mode = "create",
    form,
    handleChange,
    loading,
    onCancel,
    onSubmit,
    attributes = [],
    initialProduct,
}) {
    const isEdit = mode === "edit";

    const [step, setStep] = useState(1);
    const [attempted, setAttempted] = useState({});

    // Mismas reglas que valida el backend (product_variant.controller.js).
    const getBasicInfoErrors = () => {
        const errors = {};
        if (!form.productId) errors.productId = "El producto es obligatorio";

        if (form.barcode) {
            const barcode = String(form.barcode).trim();
            if (barcode.startsWith("-")) errors.barcode = "El código de barras no puede ser negativo";
            else if (barcode.length > 20) errors.barcode = "El código de barras no puede superar 20 caracteres";
        }

        const stock = Number(form.stock);
        if (form.stock === undefined || form.stock === null || form.stock === "" || isNaN(stock)) {
            errors.stock = "El stock es obligatorio";
        } else if (stock < 0) errors.stock = "El stock no puede ser negativo";
        else if (stock > 10000) errors.stock = "El stock no puede ser mayor a 10.000";

        const price = Number(form.price);
        if (form.price === undefined || form.price === null || form.price === "" || isNaN(price)) {
            errors.price = "El precio es obligatorio";
        } else if (price < 0) errors.price = "El precio no puede ser negativo";
        else if (price > 100000000) errors.price = "El precio no puede ser mayor a 100.000.000";

        return errors;
    };

    const STEP_ERROR_GETTERS = { 1: getBasicInfoErrors, 2: () => ({}), 3: () => ({}) };
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

            {/* Indicador de pasos */}
            <Stepper
                value={step}
                onValueChange={goToStep}
                className="w-full mb-4"
            >
                <StepperNav>

                    {[1, 2, 3].map((item) => (

                        <StepperItem
                            key={item}
                            step={item}
                        >

                            <StepperTrigger>

                                <StepperIndicator
                                    className="
                            data-[state=active]:bg-blue-600
                            data-[state=active]:text-white

                            data-[state=completed]:bg-blue-600
                            data-[state=completed]:text-white

                            data-[state=inactive]:bg-muted
                            data-[state=inactive]:text-muted-foreground
                        "
                                >
                                    {item}
                                </StepperIndicator>

                            </StepperTrigger>

                            {item < 3 && (

                                <StepperSeparator
                                    className="
                            group-data-[state=completed]/step:bg-blue-600
                        "
                                />

                            )}

                        </StepperItem>

                    ))}

                </StepperNav>
            </Stepper>

            {/* PASO 1 - Información básica */}
            {step === 1 && (
                <BasicInfoSection
                    form={form}
                    handleChange={handleChange}
                    initialProduct={initialProduct}
                    errors={currentStepErrors}
                />
            )}

            {/* PASO 2 - Atributos */}
            {step === 2 && (
                <AttributeSection
                    form={form}
                    handleChange={handleChange}
                    attributes={attributes}
                    mode={mode}
                />
            )}

            {/* PASO 3 - Imágenes */}
            {step === 3 && (
                <ImagesSection
                    form={form}
                    handleChange={handleChange}
                />
            )}

            {/* BOTONES */}
            <div className="flex justify-between pt-4 border-t">

                <Button
                    type="button"
                    variant="outline"
                    disabled={step === 1}
                    onClick={() => goToStep(step - 1)}
                    className="
        border-slate-300
        hover:bg-slate-100
    "
                >
                    Anterior
                </Button>

                {step < 3 ? (

                    <Button
                        type="button"
                        onClick={() => goToStep(step + 1)}
                        className="
        bg-blue-600
        hover:bg-blue-700
        text-white
    "
                    >
                        Siguiente
                    </Button>

                ) : (

                    <div className="flex gap-2">

                        <Button
                            type="button"
                            onClick={onCancel}
                            className="
        bg-red-600
        hover:bg-red-700
        text-white
    "
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="
        bg-green-600
        hover:bg-green-700
        text-white
    "
                        >
                            {loading
                                ? isEdit
                                    ? "Guardando..."
                                    : "Creando..."
                                : isEdit
                                    ? "Guardar cambios"
                                    : "Crear variante"}
                        </Button>

                    </div>

                )}

            </div>

        </div>
    );
}