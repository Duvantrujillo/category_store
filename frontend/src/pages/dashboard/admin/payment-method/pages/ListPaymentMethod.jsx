import { ShieldOff } from "lucide-react";
import { useAllPaymentMethod } from "../hooks/usePaymentMethod";
import PaymentMethodTable from "../components/payment-method-list/PaymentMethodTable";
import PaymentMethodCreateDialog from "../components/payment-method-create/PaymentMethodCreateDialog";
import { useHasPermission } from "@/lib/permissions";

function ListPaymentMethod() {
  const canView   = useHasPermission("payment-methods.view");
  const canCreate = useHasPermission("payment-methods.create");
  const { methods = [], loading, refetch } = useAllPaymentMethod({ skip: !canView });

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <ShieldOff size={40} className="opacity-40" />
        <p className="text-sm">No tienes permisos para visualizar esta sección.</p>
      </div>
    );
  }

  return (
    <div className="px-6 pt-2 pb-6 space-y-3">
      <div className="flex items-center justify-end gap-3">
        <PaymentMethodCreateDialog onRefresh={refetch} disabled={!canCreate} />
      </div>

      <PaymentMethodTable methods={methods} loading={loading} onRefresh={refetch} />
    </div>
  );
}

export default ListPaymentMethod;
