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

    return (
        <div className="grid gap-4">

            {/* Indicador de pasos */}
            <Stepper
                value={step}
                onValueChange={setStep}
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
                    onClick={() => setStep((prev) => prev - 1)}
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
                        onClick={() => setStep((prev) => prev + 1)}
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
                            onClick={onSubmit}
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