import { useState } from "react";

import BrandRow from "./BrandRow";
import DeleteBrandDialog from "../brand-delete/BrandDeleteDialog";

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

function BrandTable({
  brands,
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
            Marcas registradas
          </CardTitle>

          <p className="text-sm text-muted-foreground mt-1">
            Lista completa de marcas.
          </p>

        </CardHeader>

        <CardContent>

          <div className="rounded-xl border overflow-hidden">

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead className="text-center">
                    Logo
                  </TableHead>
                  <TableHead className="text-center">
                    Marca
                  </TableHead>

                  <TableHead className="text-center">
                    Descripción
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

                {Array.isArray(brands) &&
                  brands.map((item) => (

                    <BrandRow
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

      <DeleteBrandDialog
        open={isOpen}
        onClose={closeConfirmModal}
        brandId={selectedId}
        onDeleted={onRefresh}
      />

    </>
  );
}

export default BrandTable;