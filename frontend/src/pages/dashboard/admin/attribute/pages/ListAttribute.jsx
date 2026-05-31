import { useAllAttribute } from "../hooks/useAttribute"
import AttributeTable from "../components/attribute-list/AttributeTable"
import AttributeCreateDialog from "../components/attribute-create/AttributeCreateDialog"

function AttributeList() {
    const { attributes = [], refetch } = useAllAttribute()

    return (
        <div className="space-y-6 p-6">

            {/* HEADER */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                {/* TÍTULO */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-zinc-900">
                        Gestión de Atributos
                    </h1>

                    <p className="text-zinc-500">
                        Administra los atributos del sistema.
                    </p>
                </div>

                {/* BOTÓN */}
                <AttributeCreateDialog onRefresh={refetch} />

            </div>

            {/* TABLA */}
            <AttributeTable
                attributes={attributes}
                onRefresh={refetch}
            />

        </div>
    )
}

export default AttributeList