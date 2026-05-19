import ShippingDetailsDialog from "./ShippingDetailsDialog";

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

function ShippingTable({ shipping }) {
  return (
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
                  Nombre
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

              {shipping.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-muted/40 transition-colors"
                >

                  <TableCell>

                    <div className="flex flex-col">

                      <span className="font-medium">
                        {item.firstName} {item.lastName}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        Cliente registrado
                      </span>

                    </div>

                  </TableCell>

                  <TableCell>
                    {item.documentNumber}
                  </TableCell>

                  <TableCell>
                    {item.phoneNumber}
                  </TableCell>

                  <TableCell>
                    {item.departament}
                  </TableCell>

                  <TableCell className="text-center">

                    <ShippingDetailsDialog item={item} />

                  </TableCell>

                </TableRow>
              ))}

            </TableBody>

          </Table>

        </div>

      </CardContent>

    </Card>
  );
}

export default ShippingTable;