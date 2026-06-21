import { MessageSquare, Package } from "lucide-react";
import ReturnItemRow from "./ReturnItemRow";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";

const fmtCOP = (n) => `$${Number(n ?? 0).toLocaleString("es-CO")}`;

export default function ReturnItemsModal({ open, item, onClose }) {
  const totalAmount = item?.items?.reduce(
    (sum, ri) => sum + Number(ri.orderItem.unitPrice) * ri.quantity,
    0
  ) ?? 0;

  const itemCount = item?.items?.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl">

        {/* Header */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 px-6 py-5">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-white text-lg font-bold tracking-tight leading-none">
                  Productos a devolver
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-sm mt-1">
                  {item?.order?.orderNumber
                    ? `Pedido ${item.order.orderNumber} — ${item.order.firstName} ${item.order.lastName}`
                    : `Solicitud #${item?.id}`}
                </DialogDescription>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-rose-500/20 text-rose-300 border-rose-500/30 shrink-0">
                {itemCount} producto{itemCount !== 1 ? "s" : ""}
              </span>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4 bg-slate-50">

          {/* Banner de motivo */}
          {item?.reason && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 shrink-0 mt-0.5">
                <MessageSquare size={13} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-0.5">Motivo de devolución</p>
                <p className="text-sm text-amber-800">{item.reason}</p>
              </div>
            </div>
          )}

          {/* Tabla */}
          {item?.items?.length > 0 ? (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="text-xs font-bold uppercase tracking-wide text-slate-400">Producto</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wide text-slate-400 text-center">Cant.</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wide text-slate-400 text-right">Precio unit.</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wide text-slate-400 text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.items.map((ri) => (
                    <ReturnItemRow key={ri.id} returnItem={ri} />
                  ))}
                </TableBody>
              </Table>

              {/* Total */}
              <div className="flex items-center justify-between px-4 py-3 bg-rose-50 border-t border-rose-200">
                <span className="text-xs font-semibold uppercase tracking-wide text-rose-500">Total a reembolsar</span>
                <span className="text-lg font-bold text-rose-700 tabular-nums">{fmtCOP(totalAmount)}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Package size={32} className="opacity-30 mb-3" />
              <p className="text-sm">No hay productos registrados en esta solicitud.</p>
            </div>
          )}

        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
