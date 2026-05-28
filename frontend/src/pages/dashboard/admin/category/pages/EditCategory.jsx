import { useMemo } from "react";

import { useAllCategory } from "../hooks/useCategory";

import CategoryTable from "../components/category-list/CategoryTable";

function CategoryList() {

  const {
    categories = [],
    loading,
    error,
    refetch,
  } = useAllCategory();

  /*
    🔥 MAP ESCALABLE
    id -> category
  */
  const categoriesMap = useMemo(() => {
    return new Map(
      categories.map((c) => [c.id, c])
    );
  }, [categories]);

  if (loading) {
    return (
      <p>
        Cargando categorías...
      </p>
    );
  }

  if (error) {
    return (
      <p>
        Error al cargar: {error}
      </p>
    );
  }

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

      </div>

      <CategoryTable
        categories={categories}
        categoriesMap={categoriesMap}
        onRefresh={refetch}
      />

    </div>
  );
}

export default CategoryList;