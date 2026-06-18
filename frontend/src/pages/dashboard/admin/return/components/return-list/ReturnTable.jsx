import { Inbox } from "lucide-react";
import ReturnRow from "./ReturnRow";
import TablePagination from "@/components/ui/TablePagination";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

function ReturnTable({ returns, totalItems, page, pageSize, onPageChange, onItems, onEdit, onRefund }) {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Solicitudes de devolución
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Gestión de devoluciones y reembolsos.</p>
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
                {["Pedido","Estado","Resolución","Monto","Reembolso","Fecha","Acciones"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 text-center whitespace-nowrap">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {returns.length > 0 ? (
                returns.map((item) => (
                  <ReturnRow
                    key={item.id}
                    item={item}
                    onItems={onItems}
                    onEdit={onEdit}
                    onRefund={onRefund}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Inbox size={30} className="opacity-40" />
                      <span className="text-sm">No hay solicitudes de devolución.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
}

export default ReturnTable;
