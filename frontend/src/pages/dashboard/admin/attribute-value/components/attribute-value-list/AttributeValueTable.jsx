import { useState } from "react";

import AttributeValueRow from "./AttributeValueRow";

import DeleteAttributeValueDialog from "../attribute-value-delete/AttributeValueDeleteDialog";

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

function AttributeValueTable({
  attributeValues,
  attributes,
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
            Valores de atributos registrados
          </CardTitle>

          <p className="text-sm text-muted-foreground mt-1">
            Lista completa de valores de atributos.
          </p>

        </CardHeader>

        <CardContent>

          <div className="rounded-xl border overflow-hidden">

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead className="text-center">
                    Atributo
                  </TableHead>
                  
                  <TableHead className="text-center">
                    Valor
                  </TableHead>


                  <TableHead className="text-center">
                    Acciones
                  </TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {Array.isArray(attributeValues) &&
                  attributeValues.map((item) => (

                    <AttributeValueRow
                      key={item.id}
                      item={item}
                      attributes={attributes}
                      onDelete={openConfirmModal}
                      onRefresh={onRefresh}
                    />

                  ))}

              </TableBody>

            </Table>

          </div>

        </CardContent>

      </Card>

      <DeleteAttributeValueDialog
        open={isOpen}
        onClose={closeConfirmModal}
        attributeValueId={selectedId}
        onDeleted={onRefresh}
      />
    </>
  );
}

export default AttributeValueTable;