import { useState } from "react";
import { Inbox } from "lucide-react";
import PaymentMethodCard from "./PaymentMethodCard";
import PaymentMethodDeleteDialog from "../payment-method-delete/PaymentMethodDeleteDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function PaymentMethodTable({ methods, onRefresh }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const openConfirmModal  = (id) => { setSelectedId(id); setIsOpen(true); };
  const closeConfirmModal = ()   => { setSelectedId(null); setIsOpen(false); };

  return (
    <>
      <Card className="rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">Métodos de pago</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Lista informativa mostrada en la tienda — no cambia la pasarela de pago (ePayco).
              </p>
            </div>
            <span className="text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full">
              {methods.length} registros
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {Array.isArray(methods) && methods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {methods.map((item) => (
                <PaymentMethodCard key={item.id} item={item} onDelete={openConfirmModal} onRefresh={onRefresh} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
              <Inbox size={36} className="opacity-40" />
              <span className="text-sm">No hay métodos de pago registrados.</span>
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentMethodDeleteDialog
        open={isOpen}
        onClose={closeConfirmModal}
        methodId={selectedId}
        onDeleted={onRefresh}
      />
    </>
  );
}

export default PaymentMethodTable;
