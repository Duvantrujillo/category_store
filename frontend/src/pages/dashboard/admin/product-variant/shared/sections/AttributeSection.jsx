import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AttributeSection({
    form,
    handleChange,
    attributes = [],
    mode = "create",
}) {
    const isEdit = mode === "edit";

    const [selectedAttributeId, setSelectedAttributeId] =
        useState(null);

    useEffect(() => {
        if (
            isEdit &&
            !selectedAttributeId &&
            Array.isArray(form.attributes) &&
            form.attributes.length > 0
        ) {
            const firstValueId =
                form.attributes[0].valueId;

            const attributeValue = attributes.find(
                (av) => av.id === firstValueId
            );

            if (attributeValue?.attribute?.id) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedAttributeId(
                    attributeValue.attribute.id
                );
            }
        }
    }, [
        isEdit,
        selectedAttributeId,
        form.attributes,
        attributes,
    ]);

    const selectedAttributeValueIds = new Set(
        (form.attributes || []).map((attr) =>
            Number(attr.valueId)
        )
    );

    const attributeGroups = attributes.reduce(
        (acc, av) => {
            const aid = av.attribute?.id;

            if (!aid) return acc;

            const isActive =
                av.attribute?.isActive === true;

            const isSelected =
                selectedAttributeValueIds.has(av.id);

            if (!isActive && !isSelected)
                return acc;

            if (!acc[aid]) {
                acc[aid] = {
                    attribute: av.attribute,
                    values: [],
                };
            }

            acc[aid].values.push(av);

            return acc;
        },
        {}
    );

    const availableAttributes =
        Object.values(attributeGroups);

    return (
        <div className="grid gap-4">

            {/* ATRIBUTOS */}
            <div className="grid grid-cols-2 gap-4 items-start">

                <div>

                    <Label>Atributo</Label>

                    <Select
                        value={
                            selectedAttributeId
                                ? String(
                                      selectedAttributeId
                                  )
                                : ""
                        }
                        onValueChange={(value) =>
                            setSelectedAttributeId(
                                Number(value)
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar atributo" />
                        </SelectTrigger>

                        <SelectContent>
                            {availableAttributes.map(
                                (group) => (
                                    <SelectItem
                                        key={
                                            group.attribute.id
                                        }
                                        value={String(
                                            group.attribute.id
                                        )}
                                    >
                                        {
                                            group.attribute
                                                .name
                                        }
                                    </SelectItem>
                                )
                            )}
                        </SelectContent>
                    </Select>

                </div>

                <div>

                    <Label>Valores</Label>

                    <Select
                        onValueChange={(value) => {
                            const id =
                                Number(value);

                            const exist =
                                form.attributes?.find(
                                    (item) =>
                                        item.valueId ===
                                        id
                                );

                            if (exist) {
                                handleChange(
                                    "attributes",
                                    (
                                        form.attributes ||
                                        []
                                    ).filter(
                                        (a) =>
                                            a.valueId !==
                                            id
                                    )
                                );

                                return;
                            }

                            handleChange(
                                "attributes",
                                [
                                    ...(form.attributes ||
                                        []),
                                    {
                                        valueId: id,
                                    },
                                ]
                            );
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar valor" />
                        </SelectTrigger>

                        <SelectContent>
                            {(selectedAttributeId &&
                            attributeGroups[
                                selectedAttributeId
                            ]
                                ? attributeGroups[
                                      selectedAttributeId
                                  ].values
                                : []
                            ).map((val) => (
                                <SelectItem
                                    key={val.id}
                                    value={String(
                                        val.id
                                    )}
                                >
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

                    {form.attributes.map(
                        (attr, index) => {
                            const av =
                                attributes.find(
                                    (a) =>
                                        a.id ===
                                        attr.valueId
                                );

                            const label = av
                                ? `${av.attribute?.name || ""} - ${av.value}`
                                : String(
                                      attr.valueId
                                  );

                            return (
                                <div
                                    key={index}
                                    className="
                                    px-3
                                    py-1
                                    rounded-md
                                    bg-muted
                                    text-sm
                                    flex
                                    items-center
                                    gap-2
                                "
                                >
                                    <span>
                                        {label}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleChange(
                                                "attributes",
                                                (
                                                    form.attributes ||
                                                    []
                                                ).filter(
                                                    (
                                                        a
                                                    ) =>
                                                        a.valueId !==
                                                        attr.valueId
                                                )
                                            )
                                        }
                                        className="ml-2 text-xs text-destructive"
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        }
                    )}

                </div>

            )}

        </div>
    );
}