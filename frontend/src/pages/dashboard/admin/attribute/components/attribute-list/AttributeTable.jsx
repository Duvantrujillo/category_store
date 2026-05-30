import { useState } from "react";

import AttributeRow from "./AttributeRow";
import DeleteAttributeDialog from "../attribute-delete/AttributeDeleteDialog";

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

function AttributeTable({ attributes, onRefresh }) {

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
            Atributos registrados
          </CardTitle>

          <p className="text-sm text-muted-foreground mt-1">
            Lista completa de atributos.
          </p>

        </CardHeader>

        <CardContent>

          <div className="rounded-xl border overflow-hidden">

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead className="text-center">
                    Nombre
                  </TableHead>

                  <TableHead className="text-center">
                    Tipo
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

                {Array.isArray(attributes) &&
                  attributes.map((item) => (

                    <AttributeRow
                      key={item.id}
                      item={item}
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

      <DeleteAttributeDialog
        open={isOpen}
        onClose={closeConfirmModal}
        attributeId={selectedId}
        onDeleted={onRefresh}
      />

    </>
  );
}

export default AttributeTable;