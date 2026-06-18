import { useEffect, useState } from "react";
import { useAllAttribute } from "../../attribute/hooks/useAttribute";
import { useAllAttributeValue } from "../hooks/useAttributeValue";
import AttributeValueTable from "../components/attribute-value-list/AttributeValueTable";
import AttributeValueCreateDialog from "../components/attribute-value-create/AttributeValueCreateDialog";

const PAGE_SIZE = 15;

function AttributeValueList() {
  const { attributeValues = [], refetch } = useAllAttributeValue();
  const { attributes = [] } = useAllAttribute();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(attributeValues.length / PAGE_SIZE));
  const paginated = attributeValues.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Valores de Atributos</h1>
          <p className="text-muted-foreground">Administra los valores asociados a cada atributo.</p>
        </div>
        <AttributeValueCreateDialog attributes={attributes} onRefresh={refetch} />
      </div>

      <AttributeValueTable
        attributeValues={paginated}
        attributes={attributes}
        totalItems={attributeValues.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onRefresh={refetch}
      />
    </div>
  );
}

export default AttributeValueList;
