import { useState } from "react";

import ProductVariantRow from "./ProductVariantRow";

import DeleteProductVariantDialog from "../product-variant-delete/ProductVariantDeleteDialog";

import {
  Table,
  TableBody,
  TableCell,
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

function ProductVariantTable({
  variants,
  onRefresh,
  products = [],
  attributes = [],
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
            Variantes registradas
          </CardTitle>

          <p className="text-sm text-muted-foreground mt-1">
            Lista completa de variantes del producto.
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
                    SKU
                  </TableHead>

                  <TableHead className="text-center">
                    Precio
                  </TableHead>

                  <TableHead className="text-center">
                    Stock
                  </TableHead>

                  <TableHead className="text-center">
                    Principal
                  </TableHead>

                  <TableHead className="text-center">
                    Estado
                  </TableHead>

                  <TableHead className="text-center">
                    Acciones
                  </TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {Array.isArray(variants) && variants.length > 0 ? (
                  variants.map((item) => (
                    <ProductVariantRow
                      key={item.id}
                      item={item}
                      onDelete={openConfirmModal}
                      onRefresh={onRefresh}
                      products={products}
                      attributes={attributes}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                      No hay registros.
                    </TableCell>
                  </TableRow>
                )}

              </TableBody>

            </Table>

          </div>

        </CardContent>

      </Card>

      <DeleteProductVariantDialog
        open={isOpen}
        onClose={closeConfirmModal}
        variantId={selectedId}
        onDeleted={onRefresh}
      />

    </>
  );

}

export default ProductVariantTable;