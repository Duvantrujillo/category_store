import { useState } from "react";
import DeleteCategoryDialog from "../category-delete/DeleteCategoryDialog";
import CategoryRow from "./CategoryRow";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function CategoryTable({ categories, onRefresh }) {

  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const openConfirmModal = (id) => {
    setSelectedId(id);
    setIsOpen(true);
  };

  const closeConfirmModal = () => {
    setSelectedId(null);
    setIsOpen(false);
  };

  return (
    <>
      <Card className="rounded-2xl shadow-sm border">

        <CardHeader className="pb-3">

          <CardTitle>
            Categorías registradas
          </CardTitle>

          <p className="text-sm text-muted-foreground mt-1">
            Lista completa de categorías.
          </p>

        </CardHeader>

        <CardContent>

          <div className="rounded-xl border overflow-hidden">

            <Table>

              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Nombre</TableHead>
                  <TableHead className="text-center">Descripción</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Orden</TableHead>
                  <TableHead className="text-center">Padre</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.isArray(categories) &&
                  categories.map((item) => (
                    <CategoryRow
                      key={item.id}
                      item={item}
                      categories={categories}
                      onDelete={openConfirmModal}
                      onRefresh={onRefresh}
                    />
                  ))
                }
              </TableBody>

            </Table>

          </div>

        </CardContent>

      </Card>

      <DeleteCategoryDialog
        open={isOpen}
        onClose={closeConfirmModal}
        categoryId={selectedId}
        onDeleted={onRefresh}
      />
    </>
  );
}

export default CategoryTable;