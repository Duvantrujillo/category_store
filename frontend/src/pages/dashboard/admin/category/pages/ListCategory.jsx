import { useAllCategory } from "../hooks/useCategory";
import CategoryTable from "../components/category-list/CategoryTable";
import CategoryCreateDialog from "../components/category-create/CategoryCreateDialog";

function CategoryList() {
  const {
    categories = [],
    refetch,
  } = useAllCategory();
  return (
    <div className="space-y-6 p-6">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="space-y-1">

          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Categorías
          </h1>

          <p className="text-muted-foreground">
            Administra las categorías del sistema.
          </p>

        </div>
   <CategoryCreateDialog
          categories={categories}
          onRefresh={refetch}
        />
      </div>

      <CategoryTable
        categories={categories}
        onRefresh={refetch}
        
      />

    </div>
  );
}

export default CategoryList;