import { Trash, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentMethodEditDialog from "@/pages/dashboard/admin/payment-method/components/payment-method-update/PaymentMethodEditDialog";
import { useHasPermission } from "@/lib/permissions";

const TYPE_LABEL = {
  DIGITAL_WALLET: "Billetera digital",
  BANK_TRANSFER:  "Transferencia bancaria",
  CREDIT_CARD:    "Tarjeta de crédito",
  INTERNATIONAL:  "Internacional",
  CASH:           "Efectivo",
};

function PaymentMethodCard({ item, onDelete, onRefresh }) {
  const canUpdate = useHasPermission("payment-methods.update");
  const canDelete = useHasPermission("payment-methods.delete");

  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:border-indigo-200 transition-all duration-200">

      <span className={`absolute top-4 right-4 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
        item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}>
        {item.isActive ? "Activo" : "Inactivo"}
      </span>

      <div className="flex items-start gap-3 pr-16">
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 transition-colors">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-sm leading-snug truncate">{item.name}</p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{TYPE_LABEL[item.type] ?? item.type}</p>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      <div className="flex items-center justify-end gap-1">
        <PaymentMethodEditDialog item={item} onRefresh={onRefresh} disabled={!canUpdate} />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none"
          onClick={() => onDelete(item.id)}
          disabled={!canDelete}
          title={!canDelete ? "Sin permiso para eliminar" : undefined}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default PaymentMethodCard;
