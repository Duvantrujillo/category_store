import { useAllAttribute } from "../hooks/useAttribute";

import AttributeTable from "../components/attribute-list/AttributeTable";


import AttributeCreateDialog from "../components/attribute-create/AttributeCreateDialog";

function AttributeList() {

    const {
        attributes = [],
        refetch,
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
                        Gestión de Atributos
                    </h1>

                    <p className="text-muted-foreground">
                        Administra los atributos del sistema.
                    </p>

                </div>


            <AttributeCreateDialog
                onRefresh={refetch}
            />
            </div>

            <AttributeTable
                attributes={attributes}
                onRefresh={refetch}
            />
        </div>

    );
}

export default AttributeList;