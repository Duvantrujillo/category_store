import { useEffect, useRef } from "react";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import ReturnSharedForm from "../../shared/ReturnSharedForm";
import { useUpdateReturn } from "../../hooks/useReturn";

export default function ReturnUpdateDialog({ open, item, onClose, onRefresh }) {
  const { form, handleChange, setInitialData, submitUpdate, loading } =
    useUpdateReturn();

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (open && item && !hasInitialized.current) {
      setInitialData({
        ...item,
        orderNumber: item.order?.orderNumber ?? `Orden #${item.orderId}`,
      });
      hasInitialized.current = true;
    }
    if (!open) {
      hasInitialized.current = false;
    }
  }, [open, item, setInitialData]);

  const handleSubmit = async () => {
    try {
      await submitUpdate(item.id);
      onRefresh?.();
      onClose();
    } catch {
      // toast ya lo maneja el hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>

      <DialogContent className="sm:max-w-2xl rounded-2xl">

        <DialogHeader>
          <DialogTitle>Actualizar solicitud</DialogTitle>
          <DialogDescription>
            {item?.order?.orderNumber
              ? `Pedido ${item.order.orderNumber}`
              : `Solicitud #${item?.id}`}
          </DialogDescription>
        </DialogHeader>

        {open && (
          loading ? (
            <div className="flex flex-col items-center gap-10">
              <Button variant="outline" disabled size="sm">
                <Spinner data-icon="inline-start" />
                Cargando...
              </Button>
            </div>
          ) : (
            <ReturnSharedForm
              mode="edit"
              form={form}
              handleChange={handleChange}
              loading={loading}
              onCancel={onClose}
              onSubmit={handleSubmit}
              existingItems={item?.items ?? []}
            />
          )
        )}

      </DialogContent>

    </Dialog>
  );
}
