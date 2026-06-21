import { useState } from "react";
import { Inbox, LayoutGrid, Network } from "lucide-react";

import CategoryCard from "./CategoryCard";
import CategoryTreeView from "./CategoryTreeView";
import DeleteCategoryDialog from "../category-delete/CategoryDeleteDialog";
import TablePagination from "@/components/ui/TablePagination";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function CategoryTable({ categories, allCategories, totalItems, page, pageSize, onPageChange, onRefresh }) {
  const [deleteId, setDeleteId] = useState(null);
  const [view, setView] = useState("cards");

  const treeData = allCategories ?? categories;

  return (
    <>
      <Card className="rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Categorías registradas
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                {view === "tree" ? "Vista jerárquica de categorías." : "Lista completa de categorías."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setView("cards")}
                  title="Vista en tarjetas"
                  className={`p-1.5 rounded-md transition-all ${
                    view === "cards"
                      ? "bg-white shadow-sm text-indigo-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setView("tree")}
                  title="Vista jerárquica"
                  className={`p-1.5 rounded-md transition-all ${
                    view === "tree"
                      ? "bg-white shadow-sm text-indigo-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Network size={15} />
                </button>
              </div>

              <span className="text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full">
                {view === "tree" ? treeData.length : totalItems} registros
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {Array.isArray(categories) && categories.length > 0 ? (
            view === "cards" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-5">
                {categories.map((item) => (
                  <CategoryCard
                    key={item.id}
                    item={item}
                    categories={categories}
                    onDelete={(id) => setDeleteId(id)}
                    onRefresh={onRefresh}
                  />
                ))}
              </div>
            ) : (
              <CategoryTreeView
                categories={treeData}
                onDelete={(id) => setDeleteId(id)}
                onRefresh={onRefresh}
              />
            )
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 py-16">
              <Inbox size={36} className="opacity-40" />
              <span className="text-sm">No hay registros.</span>
            </div>
          )}

          {view === "cards" && (
            <TablePagination
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={onPageChange}
            />
          )}
        </CardContent>
      </Card>

      <DeleteCategoryDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        categoryId={deleteId}
        onDeleted={onRefresh}
      />
    </>
  );
}

export default CategoryTable;
