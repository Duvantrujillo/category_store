import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllCategory } from "../hooks/useCategory";
import CategoryTable from "../components/category-list/CategoryTable";
import CategoryCreateDialog from "../components/category-create/CategoryCreateDialog";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function CategoryList() {
  const canView   = useHasPermission("categories.view");
  const canCreate = useHasPermission("categories.create");
  const { categories = [], refetch } = useAllCategory({ skip: !canView });
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
  const paginated = categories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        <CategoryCreateDialog
          categories={categories}
          onRefresh={refetch}
          disabled={!canCreate}
        />
      </div>
      <CategoryTable
        categories={paginated}
        totalItems={categories.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onRefresh={refetch}
      />
    </div>
  );
}

export default CategoryList;
