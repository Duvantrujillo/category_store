import { useState } from "react";

import ProductRow from "./ProductRow";
import DeleteProductDialog from "../product-delete/ProductDeleteDialog";

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

function ProductTable({
  products,
  onRefresh,
}) {
  const [isOpen, setIsOpen] =
    useState(false);

  const [selectedId, setSelectedId] =
    useState(null);

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
            Productos registrados
          </CardTitle>

          <p className="text-sm text-muted-foreground mt-1">
            Lista completa de productos.
          </p>

        </CardHeader>

        <CardContent>

          <div className="rounded-xl border overflow-hidden">

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead className="text-center">
                    Imagen
                  </TableHead>

                  <TableHead className="text-center">
                    Producto
                  </TableHead>

                  <TableHead className="text-center">
                    Categoría
                  </TableHead>

                  <TableHead className="text-center">
                    Marca
                  </TableHead>

                  <TableHead className="text-center">
                    Publicación
                  </TableHead>


                  <TableHead className="text-center">
                    Acciones
                  </TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {Array.isArray(products) &&
                  products.map((item) => (

                    <ProductRow
                      key={item.id}
                      item={item}
                      onDelete={openConfirmModal}
                      onRefresh={onRefresh}
                    />

                  ))}

              </TableBody>

            </Table>

          </div>

        </CardContent>

      </Card>

      <DeleteProductDialog
        open={isOpen}
        onClose={closeConfirmModal}
        productId={selectedId}
        onDeleted={onRefresh}
      />

    </>
  );
}

export default ProductTable;