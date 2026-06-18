import { Inbox } from "lucide-react";
import ShipmentRow from "./ShipmentRow";
import TablePagination from "@/components/ui/TablePagination";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

function ShipmentTable({ shipments, totalItems, page, pageSize, onPageChange, onEdit, onHistory }) {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Envíos registrados
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Seguimiento y gestión de envíos.</p>
          </div>
          <span className="text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full">
            {totalItems} registros
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                {["Pedido","Estado","Transportista","Rastreo","Fecha","Acciones"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 text-center whitespace-nowrap">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {shipments.length > 0 ? (
                shipments.map((shipment) => (
                  <ShipmentRow
                    key={shipment.id}
                    shipment={shipment}
                    onEdit={onEdit}
                    onHistory={onHistory}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Inbox size={30} className="opacity-40" />
                      <span className="text-sm">No hay envíos registrados.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination page={page} pageSize={pageSize} totalItems={totalItems} onPageChange={onPageChange} />
      </CardContent>
    </Card>
  );
}

export default ShipmentTable;
