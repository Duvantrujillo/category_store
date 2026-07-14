import { Inbox } from "lucide-react";
import OrderRow from "./OrderRow";
import TablePagination from "@/components/ui/TablePagination";
import TableSkeleton from "@/components/ui/TableSkeleton";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

function OrderTable({ orders, loading, totalItems, page, pageSize, onPageChange, onOpenDetails, onOpenItems, onOpenPayment, onOpenShippingGuide }) {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Órdenes registradas
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Gestión de pedidos y pagos.</p>
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
                {["Pedido","Cliente","Estado","Total","Fecha","Acciones"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 text-center whitespace-nowrap">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableSkeleton columns={6} />
              ) : orders?.length > 0 ? (
                orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onOpenDetails={onOpenDetails}
                    onOpenItems={onOpenItems}
                    onOpenPayment={onOpenPayment}
                    onOpenShippingGuide={onOpenShippingGuide}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Inbox size={30} className="opacity-40" />
                      <span className="text-sm">No hay órdenes registradas.</span>
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

export default OrderTable;
