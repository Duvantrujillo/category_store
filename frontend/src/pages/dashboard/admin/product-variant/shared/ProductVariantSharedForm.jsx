import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ProductVariantSharedForm({
    mode = "create",
    form,
    handleChange,
    loading,
    onCancel,
    onSubmit,
    attributes = [],
    products = [],
}) {
    const isEdit = mode === "edit";
    const [selectedAttributeId, setSelectedAttributeId] = useState(null);

    useEffect(() => {
        if (
            isEdit &&
            !selectedAttributeId &&
            Array.isArray(form.attributes) &&
            form.attributes.length > 0
        ) {
            const firstValueId = form.attributes[0].valueId;
            const attributeValue = attributes.find(
                (av) => av.id === firstValueId
            );
            if (attributeValue?.attribute?.id) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedAttributeId(attributeValue.attribute.id);
            }
        }
    }, [isEdit, selectedAttributeId, form.attributes, attributes]);

    // agrupar attributeValues por atributo
    const selectedAttributeValueIds = new Set(
        (form.attributes || []).map((attr) => Number(attr.valueId))
    );

    const attributeGroups = attributes.reduce((acc, av) => {
        const aid = av.attribute?.id;
        if (!aid) return acc;

        const isActive = av.attribute?.isActive === true;
        const isSelected = selectedAttributeValueIds.has(av.id);

        if (!isActive && !isSelected) return acc;

        if (!acc[aid]) acc[aid] = { attribute: av.attribute, values: [] };
        acc[aid].values.push(av);
        return acc;
    }, {});
    const availableAttributes = Object.values(attributeGroups);



    return (

        <div className="grid gap-4">
            {/* PRODUCTO */}
            <div>

                <Label>Producto</Label>

                <Select
                    value={
                        form.productId
                            ? String(form.productId)
                            : ""
                    }
                    onValueChange={(value) =>
                        handleChange(
                            "productId",
                            Number(value)
                        )
                    }
                >

                    <SelectTrigger>

                        <SelectValue placeholder="Seleccionar producto" />

                    </SelectTrigger>

                    <SelectContent>

                        {products
                            .filter(
                                (product) =>
                                    product.status === "ACTIVE" ||
                                    product.status === "DRAFT"
                            )
                            .map((product) => (

                                <SelectItem
                                    key={product.id}
                                    value={String(product.id)}
                                >

                                    {product.name}

                                </SelectItem>

                            ))}

                    </SelectContent>

                </Select>

            </div>

            {/* BARCODE */}
            <div>

                <Label>Barcode</Label>

                <Input
                    type="text"
                    value={form.barcode || ""}
                    onChange={(e) => handleChange("barcode", e.target.value)}
                    placeholder="Código de barras"
                />

            </div>

            {/* STOCK */}
            <div>

                <Label>Stock</Label>

                <Input
                    type="number"
                    value={form.stock || ""}
                    onChange={(e) =>
                        handleChange(
                            "stock",
                            e.target.value
                        )
                    }
                    placeholder="0"
                />

            </div>

            {/* DEFAULT */}
            <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-3">

                <div>

                    <Label>Variante principal</Label>

                </div>

                <Select
                    value={
                        form.isDefault
                            ? "true"
                            : "false"
                    }
                    onValueChange={(value) =>
                        handleChange(
                            "isDefault",
                            value === "true"
                        )
                    }
                >

                    <SelectTrigger className="w-32">

                        <SelectValue />

                    </SelectTrigger>

                    <SelectContent>

                        <SelectItem value="true">
                            Sí
                        </SelectItem>

                        <SelectItem value="false">
                            No
                        </SelectItem>

                    </SelectContent>

                </Select>

            </div>

            {/* ESTADO */}
            <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-3">

                <div>

                    <Label>Estado</Label>

                </div>

                <Select
                    value={
                        form.isActive
                            ? "true"
                            : "false"
                    }
                    onValueChange={(value) =>
                        handleChange(
                            "isActive",
                            value === "true"
                        )
                    }
                >

                    <SelectTrigger className="w-32">

                        <SelectValue />

                    </SelectTrigger>

                    <SelectContent>

                        <SelectItem value="true">
                            Activo
                        </SelectItem>

                        <SelectItem value="false">
                            Inactivo
                        </SelectItem>

                    </SelectContent>

                </Select>

            </div>

            {/* ATRIBUTOS */}
            <div className="grid grid-cols-2 gap-4 items-start">

                <div>

                    <Label>Atributo</Label>

                    <Select
                        value={selectedAttributeId ? String(selectedAttributeId) : ""}
                        onValueChange={(value) =>
                            setSelectedAttributeId(Number(value))
                        }
                    >

                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar atributo" />
                        </SelectTrigger>

                        <SelectContent>
                            {availableAttributes.map((group) => (
                                <SelectItem
                                    key={group.attribute.id}
                                    value={String(group.attribute.id)}
                                >
                                    {group.attribute.name}
                                </SelectItem>
                            ))}
                        </SelectContent>

                    </Select>

                </div>

                <div>

                    <Label>Valores</Label>

                    <Select
                        onValueChange={(value) => {
                            const id = Number(value);

                            const exist = form.attributes?.find(
                                (item) => item.valueId === id
                            );

                            if (exist) {
                                handleChange(
                                    "attributes",
                                    (form.attributes || []).filter(
                                        (a) => a.valueId !== id
                                    )
                                );
                                return;
                            }

                            handleChange(
                                "attributes",
                                [
                                    ...(form.attributes || []),
                                    { valueId: id },
                                ]
                            );
                        }}
                    >

                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar valor" />
                        </SelectTrigger>

                        <SelectContent>
                            {(selectedAttributeId && attributeGroups[selectedAttributeId]
                                ? attributeGroups[selectedAttributeId].values
                                : []
                            ).map((val) => (
                                <SelectItem key={val.id} value={String(val.id)}>
                                    {val.value}
                                </SelectItem>
                            ))}
                        </SelectContent>

                    </Select>

                </div>

            </div>

            {/* ATRIBUTOS SELECCIONADOS */}
            {form.attributes?.length > 0 && (

                <div className="flex flex-wrap gap-2">

                    {form.attributes.map((attr, index) => {

                        const av = attributes.find(
                            (a) => a.id === attr.valueId
                        );

                        const label = av
                            ? `${av.attribute?.name || ""} - ${av.value}`
                            : String(attr.valueId);

                        return (

                            <div
                                key={index}
                                className="
                  px-3
                  py-1
                  rounded-md
                  bg-muted
                  text-sm
                  flex items-center gap-2
                "
                            >

                                <span>{label}</span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleChange(
                                            "attributes",
                                            (form.attributes || []).filter(
                                                (a) => a.valueId !== attr.valueId
                                            )
                                        )
                                    }
                                    className="ml-2 text-xs text-destructive"
                                >
                                    ×
                                </button>

                            </div>

                        );

                    })}

                </div>

            )}

            {/* IMÁGENES */}
            <div className="grid grid-cols-1 gap-3">

                <div>

                    <Label>Imagen principal</Label>

                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            handleChange(
                                "mainImage",
                                e.target.files?.[0] || null
                            )
                        }
                    />

                </div>

                <div>

                    <Label>Galería (4 slots)</Label>

                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {[0, 1, 2, 3].map((idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        const newImgs = Array.isArray(form.images) ? [...form.images] : [null, null, null, null];
                                        newImgs[idx] = file;
                                        handleChange("images", newImgs);
                                    }}
                                />
                                <div className="mt-2">
                                    {form.images?.[idx] && (
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImgs = Array.isArray(form.images)
                                                        ? [...form.images]
                                                        : [null, null, null, null];
                                                    newImgs[idx] = null;
                                                    handleChange("images", newImgs);
                                                }}
                                                className="absolute right-0 top-0 z-10 h-6 w-6 rounded-full bg-black/70 text-white text-xs leading-none"
                                            >
                                                ×
                                            </button>
                                            <img
                                                src={
                                                    form.images[idx] instanceof File
                                                        ? URL.createObjectURL(form.images[idx])
                                                        : `${import.meta.env.VITE_API_URL}${form.images[idx]}`
                                                }
                                                alt={`slot-${idx + 1}`}
                                                className="w-20 h-20 object-cover rounded-md border"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

            </div>

            {/* PREVIEW */}
            {(form.mainImage || (form.images && form.images.length > 0)) && (

                <div className="flex flex-col gap-3">

                    {form.mainImage && (

                        <div className="relative inline-flex">
                            <button
                                type="button"
                                onClick={() => handleChange("mainImage", null)}
                                className="absolute right-0 top-0 z-10 h-8 w-8 rounded-full bg-black/70 text-white text-sm"
                            >
                                ×
                            </button>
                            <div className="pt-2">
                                <Label>Principal</Label>
                                <img
                                    src={
                                        form.mainImage instanceof File
                                            ? URL.createObjectURL(form.mainImage)
                                            : `${import.meta.env.VITE_API_URL}${form.mainImage}`
                                    }
                                    alt="principal"
                                    className="w-36 h-36 object-cover rounded-md border"
                                />
                            </div>
                        </div>

                    )}

                    {form.images?.length > 0 && (

                        <div>
                            <Label>Galería</Label>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {form.images.map((file, index) => (
                                    file ? (
                                        <img
                                            key={index}
                                            src={
                                                file instanceof File
                                                    ? URL.createObjectURL(file)
                                                    : `${import.meta.env.VITE_API_URL}${file}`
                                            }
                                            alt={`gallery-${index}`}
                                            className="w-20 h-20 object-cover rounded-md border"
                                        />
                                    ) : null
                                ))}
                            </div>
                        </div>

                    )}

                </div>

            )}

            {/* BOTONES */}
            <div className="flex justify-end gap-2 mt-4">

                <Button
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancelar
                </Button>

                <Button
                    onClick={onSubmit}
                    disabled={loading}
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

        </div>

    );

}