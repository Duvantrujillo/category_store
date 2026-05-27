import { useState } from "react";

import DeleteShippingDialog from "../shipping-delete/DeleteShippingDialog";
import ShippingRow from "./ShippingRow";



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

function ShippingTable({ shipping, onRefresh }) {
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

          <div className="flex items-center justify-between">

            <div>

              <CardTitle>
                Usuarios registrados
              </CardTitle>

              <p className="text-sm text-muted-foreground mt-1">
                Lista completa de envíos registrados.
              </p>

            </div>

          </div>

        </CardHeader>

        <CardContent>

          <div className="rounded-xl border overflow-hidden">

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead className="text-center">
                    Cliente
                  </TableHead>

                  <TableHead className="text-center">
                    Documento
                  </TableHead>

                  <TableHead className="text-center">
                    Teléfono
                  </TableHead>

                  <TableHead className="text-center">
                    Departamento
                  </TableHead>

                  <TableHead className="text-center">
                    Acciones
                  </TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                

                  {
                    shipping.map((item) => (

                      <ShippingRow
                        key={item.id}
                        item={item}
                        onDelete={openConfirmModal}
                      />

                    ))
                  }


              </TableBody>

            </Table>

          </div>

        </CardContent>

      </Card>
      <DeleteShippingDialog
        open={isOpen}
        onClose={closeConfirmModal}
        shippingId={selectedId}
        onDeleted={onRefresh}
      />
    </>
  );
}

export default ShippingTable;