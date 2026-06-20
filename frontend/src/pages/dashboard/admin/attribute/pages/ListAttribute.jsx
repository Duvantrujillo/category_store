import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllAttribute } from "../hooks/useAttribute";
import AttributeTable from "../components/attribute-list/AttributeTable";
import AttributeCreateDialog from "../components/attribute-create/AttributeCreateDialog";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function AttributeList() {
  const canView   = useHasPermission("attributes.view");
  const canCreate = useHasPermission("attributes.create");
  const { attributes = [], refetch } = useAllAttribute({ skip: !canView });
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(attributes.length / PAGE_SIZE));
  const paginated = attributes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        <AttributeCreateDialog onRefresh={refetch} disabled={!canCreate} />
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
