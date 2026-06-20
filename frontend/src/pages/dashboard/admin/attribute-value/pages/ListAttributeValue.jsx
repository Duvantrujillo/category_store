import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllAttribute } from "../../attribute/hooks/useAttribute";
import { useAllAttributeValue } from "../hooks/useAttributeValue";
import AttributeValueTable from "../components/attribute-value-list/AttributeValueTable";
import AttributeValueCreateDialog from "../components/attribute-value-create/AttributeValueCreateDialog";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function AttributeValueList() {
  const canView   = useHasPermission("attribute-values.view");
  const canCreate = useHasPermission("attribute-values.create");
  const { attributeValues = [], refetch } = useAllAttributeValue({ skip: !canView });
  const { attributes = [] } = useAllAttribute({ skip: !canView });
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(attributeValues.length / PAGE_SIZE));
  const paginated = attributeValues.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <ShieldOff size={40} className="opacity-40" />
        <p className="text-sm">No tienes permisos para visualizar esta sección.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-end">
        <AttributeValueCreateDialog attributes={attributes} onRefresh={refetch} disabled={!canCreate} />
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
