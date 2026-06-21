import { useEffect, useState } from "react";
import { DollarSign, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useCreateRefund, useProcessRefund } from "../../hooks/useReturn";
import { useHasPermission } from "@/lib/permissions";
import { getPaymentMethods } from "../../api/returnApi";

const fmtCOP = (n) => `$${Number(n ?? 0).toLocaleString("es-CO")}`;

const InfoRow = ({ label, value, mono, badge }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    {badge
      ? badge
      : <span className={`text-sm font-medium text-slate-800 ${mono ? "font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md" : ""}`}>{value}</span>
    }
  </div>
);

export default function RefundModal({ open, item, onClose, onRefresh }) {
  const canCreate  = useHasPermission("refunds.create");
  const canProcess = useHasPermission("refunds.process");
  const { submitCreate, loading: loadingCreate } = useCreateRefund();
  const { form, handleChange, resetForm, submitProcess, loading: loadingProcess } = useProcessRefund();
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    if (!open) return;
    getPaymentMethods()
      .then((res) => setPaymentMethods(res?.methods ?? []))
      .catch(() => setPaymentMethods([]));
  }, [open]);

  const refund = item?.refunds?.[0];
  const hasRefund = !!refund;
  const isProcessed = refund?.status === "PROCESSED";

  const totalAmount = item?.items?.reduce(
    (sum, ri) => sum + Number(ri.orderItem.unitPrice) * ri.quantity,
    0
  ) ?? 0;

  const handleCreate = async () => {
    try { await submitCreate(item.id); onRefresh?.(); onClose(); } catch { /* hook maneja el toast */ }
  };

  const handleProcess = async () => {
    try { await submitProcess(refund.id); resetForm(); onRefresh?.(); onClose(); } catch { /* hook maneja el toast */ }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl">

        {/* Header */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold tracking-tight leading-none">
              Gestionar reembolso
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm mt-1">
              {item?.order?.orderNumber
                ? `Pedido ${item.order.orderNumber}`
                : `Solicitud #${item?.id}`}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-4 bg-slate-50">

          {/* Banner de monto */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <DollarSign size={16} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Monto a reembolsar</p>
                <p className="text-xl font-bold text-emerald-800 tabular-nums leading-none mt-0.5">{fmtCOP(totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Estado / formulario según caso */}
          {!hasRefund && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <Clock size={14} />
                <p className="text-sm font-medium">Sin reembolso creado</p>
              </div>
              <p className="text-sm text-slate-500">
                Al crear el reembolso quedará en estado <span className="font-semibold text-slate-700">Pendiente</span> hasta que sea procesado.
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={onClose} disabled={loadingCreate} className="rounded-xl">
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={loadingCreate || !canCreate}
                  title={!canCreate ? "Sin permiso para registrar reembolsos" : undefined}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {loadingCreate ? <><Loader2 size={14} className="animate-spin mr-1.5" />Creando...</> : "Crear reembolso"}
                </Button>
              </div>
            </div>
          )}

          {hasRefund && !isProcessed && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <Clock size={14} />
                <p className="text-sm font-semibold">Pendiente de pago</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Método de pago</Label>
                  {paymentMethods.length > 0 ? (
                    <Select value={form.method} onValueChange={(val) => handleChange("method", val)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecciona un método" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Ej: Transferencia, Efectivo, Epayco"
                      value={form.method}
                      onChange={(e) => handleChange("method", e.target.value)}
                      className="rounded-xl"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Referencia</Label>
                  <Input
                    placeholder="Número de comprobante"
                    value={form.reference}
                    onChange={(e) => handleChange("reference", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={onClose} disabled={loadingProcess} className="rounded-xl">
                  Cancelar
                </Button>
                <Button
                  onClick={handleProcess}
                  disabled={loadingProcess || !canProcess}
                  title={!canProcess ? "Sin permiso para procesar reembolsos" : undefined}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {loadingProcess ? <><Loader2 size={14} className="animate-spin mr-1.5" />Procesando...</> : "Marcar como pagado"}
                </Button>
              </div>
            </div>
          )}

          {hasRefund && isProcessed && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-0">
              <div className="flex items-center gap-2 text-green-700 pb-2.5 mb-0.5">
                <CheckCircle2 size={14} />
                <p className="text-sm font-semibold">Reembolso completado</p>
              </div>
              {refund.method && <InfoRow label="Método" value={refund.method} />}
              {refund.reference && <InfoRow label="Referencia" value={refund.reference} mono />}
              {refund.paidAt && <InfoRow label="Fecha de pago" value={new Date(refund.paidAt).toLocaleString("es-CO")} />}
              <div className="flex justify-end pt-3">
                <Button variant="outline" onClick={onClose} className="rounded-xl">Cerrar</Button>
              </div>
            </div>
          )}

        </div>

      </DialogContent>
    </Dialog>
  );
}
