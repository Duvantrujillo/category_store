import { useEffect, useState } from "react";
import { useAllCategory } from "../hooks/useCategory";
import CategoryTable from "../components/category-list/CategoryTable";
import CategoryCreateDialog from "../components/category-create/CategoryCreateDialog";

const PAGE_SIZE = 15;

function CategoryList() {
  const { categories = [], refetch } = useAllCategory();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
  const paginated = categories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Categorías</h1>
          <p className="text-muted-foreground">Administra las categorías del sistema.</p>
        </div>
        <CategoryCreateDialog categories={categories} onRefresh={refetch} />
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
