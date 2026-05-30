import { useAllAttribute } from "../../attribute/hooks/useAttribute";
import { useAllAttributeValue } from "../hooks/useAttributeValue";

import AttributeValueTable from "../components/attribute-value-list/AttributeValueTable";

import AttributeValueCreateDialog from "../components/attribute-value-create/AttributeValueCreateDialog";

function AttributeValueList() {

    const {
        attributeValues = [],
        refetch,
    } = useAllAttributeValue();

    const {
        attributes = [],
    } = useAllAttribute();

    return (

        <div className="space-y-6 p-6">

            <div
                className="
                    flex flex-col gap-4
                    md:flex-row
                    md:items-center
                    md:justify-between
                "
            >

                <div className="space-y-1">

                    <h1 className="text-3xl font-bold tracking-tight">
                        Gestión de Valores de Atributos
                    </h1>

                    <p className="text-muted-foreground">
                        Administra los valores asociados a cada atributo.
                    </p>

                </div>

                <AttributeValueCreateDialog
                    attributes={attributes}
                    onRefresh={refetch}
                />

            </div>

            <AttributeValueTable
                attributeValues={attributeValues}
                attributes={attributes}
                onRefresh={refetch}
            />

        </div>

    );

}

export default AttributeValueList;