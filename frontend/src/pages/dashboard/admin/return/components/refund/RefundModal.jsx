import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useCreateRefund, useProcessRefund } from "../../hooks/useReturn";
import { getPaymentMethods } from "../../api/returnApi";

export default function RefundModal({ open, item, onClose, onRefresh }) {
  const { submitCreate, loading: loadingCreate } = useCreateRefund();

  const {
    form,
    handleChange,
    resetForm,
    submitProcess,
    loading: loadingProcess,
  } = useProcessRefund();

  const [paymentMethods, setPaymentMethods] = useState([]);

  /* Cargar métodos de pago disponibles en DB al abrir */
  useEffect(() => {
    if (!open) return;
    getPaymentMethods()
      .then((res) => setPaymentMethods(res?.methods ?? []))
      .catch(() => setPaymentMethods([]));
  }, [open]);

  const refund = item?.refunds?.[0];
  const hasRefund = !!refund;
  const isProcessed = refund?.status === "PROCESSED";

  const totalAmount =
    item?.items?.reduce(
      (sum, ri) => sum + Number(ri.orderItem.unitPrice) * ri.quantity,
      0
    ) ?? 0;

  const handleCreate = async () => {
    try {
      await submitCreate(item.id);
      onRefresh?.();
      onClose();
    } catch {
      // toast ya lo maneja el hook
    }
  };

  const handleProcess = async () => {
    try {
      await submitProcess(refund.id);
      resetForm();
      onRefresh?.();
      onClose();
    } catch {
      // toast ya lo maneja el hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>

      <DialogContent className="sm:max-w-md rounded-2xl">

        <DialogHeader>
          <DialogTitle>Gestionar reembolso</DialogTitle>
          <DialogDescription>
            {item?.order?.orderNumber
              ? `Pedido ${item.order.orderNumber}`
              : `Solicitud #${item?.id}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-1">

          {/* RESUMEN MONTO */}
          <div className="rounded-xl border px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Monto a reembolsar</span>
            <span className="font-semibold">
              ${totalAmount.toLocaleString("es-CO")}
            </span>
          </div>

          {/* SIN REEMBOLSO → crear */}
          {!hasRefund && (
            <>
              <p className="text-sm text-muted-foreground">
                Aún no hay reembolso creado para esta solicitud. Al crearlo quedará en estado{" "}
                <strong>Pendiente</strong>.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose} disabled={loadingCreate}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={loadingCreate}>
                  {loadingCreate ? "Creando..." : "Crear reembolso"}
                </Button>
              </div>
            </>
          )}

          {/* CON REEMBOLSO PENDIENTE → procesar */}
          {hasRefund && !isProcessed && (
            <>
              <div className="rounded-xl border px-4 py-3 text-sm flex justify-between">
                <span className="text-muted-foreground">Estado del reembolso</span>
                <span className="font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full text-xs">
                  Pendiente
                </span>
              </div>

              {/* MÉTODO DE PAGO — Select con valores de la DB */}
              <div className="flex flex-col gap-1.5">
                <Label>Método de pago</Label>
                {paymentMethods.length > 0 ? (
                  <Select
                    value={form.method}
                    onValueChange={(val) => handleChange("method", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un método" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Ej: Transferencia, Efectivo, Epayco"
                    value={form.method}
                    onChange={(e) => handleChange("method", e.target.value)}
                  />
                )}
              </div>

              {/* REFERENCIA */}
              <div className="flex flex-col gap-1.5">
                <Label>Referencia</Label>
                <Input
                  placeholder="Número de comprobante"
                  value={form.reference}
                  onChange={(e) => handleChange("reference", e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose} disabled={loadingProcess}>
                  Cancelar
                </Button>
                <Button onClick={handleProcess} disabled={loadingProcess}>
                  {loadingProcess ? "Procesando..." : "Marcar como pagado"}
                </Button>
              </div>
            </>
          )}

          {/* REEMBOLSO YA PROCESADO */}
          {hasRefund && isProcessed && (
            <div className="flex flex-col gap-2">
              <div className="rounded-xl border px-4 py-3 text-sm flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <span className="font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs">
                  Pagado
                </span>
              </div>
              {refund.method && (
                <div className="rounded-xl border px-4 py-3 text-sm flex justify-between">
                  <span className="text-muted-foreground">Método</span>
                  <span>{refund.method}</span>
                </div>
              )}
              {refund.reference && (
                <div className="rounded-xl border px-4 py-3 text-sm flex justify-between">
                  <span className="text-muted-foreground">Referencia</span>
                  <span className="font-mono">{refund.reference}</span>
                </div>
              )}
              {refund.paidAt && (
                <div className="rounded-xl border px-4 py-3 text-sm flex justify-between">
                  <span className="text-muted-foreground">Fecha de pago</span>
                  <span>{new Date(refund.paidAt).toLocaleString("es-CO")}</span>
                </div>
              )}
              <div className="flex justify-end pt-1">
                <Button variant="outline" onClick={onClose}>Cerrar</Button>
              </div>
            </div>
          )}

        </div>

      </DialogContent>

    </Dialog>
  );
}
