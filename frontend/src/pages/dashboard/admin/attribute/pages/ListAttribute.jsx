import { useEffect, useState } from "react";
import { useAllAttribute } from "../hooks/useAttribute";
import AttributeTable from "../components/attribute-list/AttributeTable";
import AttributeCreateDialog from "../components/attribute-create/AttributeCreateDialog";

const PAGE_SIZE = 15;

function AttributeList() {
  const { attributes = [], refetch } = useAllAttribute();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(attributes.length / PAGE_SIZE));
  const paginated = attributes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-zinc-900">Gestión de Atributos</h1>
          <p className="text-zinc-500">Administra los atributos del sistema.</p>
        </div>
        <AttributeCreateDialog onRefresh={refetch} />
      </div>

      <AttributeTable
        attributes={paginated}
        totalItems={attributes.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onRefresh={refetch}
      />
    </div>
  );
}

export default AttributeList;
