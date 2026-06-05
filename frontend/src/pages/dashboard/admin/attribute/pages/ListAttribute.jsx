import { useEffect, useState } from "react"
import { useAllAttribute } from "../hooks/useAttribute"
import AttributeTable from "../components/attribute-list/AttributeTable"
import TablePagination from "@/components/ui/TablePagination"
import AttributeCreateDialog from "../components/attribute-create/AttributeCreateDialog"

const PAGE_SIZE = 10;

function AttributeList() {
    const { attributes = [], refetch } = useAllAttribute()
    const [page, setPage] = useState(1)
    const totalPages = Math.max(1, Math.ceil(attributes.length / PAGE_SIZE))
    const paginatedAttributes = attributes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages)
        }
    }, [page, totalPages])

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
                attributes={paginatedAttributes}
                onRefresh={refetch}
            />

            <TablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalItems={attributes.length}
                onPageChange={setPage}
                className="pt-4"
            />

        </div>
    )
}

export default AttributeList