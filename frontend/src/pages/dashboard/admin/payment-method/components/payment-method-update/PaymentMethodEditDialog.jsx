import { useState, useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import PaymentMethodSharedForm from "../../shared/PaymentMethodSharedForm";
import { useUpdatePaymentMethod } from "../../hooks/usePaymentMethod";

export default function PaymentMethodEditDialog({ item, onRefresh, disabled = false }) {
  const [open, setOpen] = useState(false);
  const { form, handleChange, submitUpdate, loading, setInitialData } = useUpdatePaymentMethod();

  const hasInitialized = useRef(false);
  useEffect(() => {
    if (open && item && !hasInitialized.current) {
      setInitialData(item);
      hasInitialized.current = true;
    }
    if (!open) hasInitialized.current = false;
  }, [open, item, setInitialData]);

  const handleSubmit = async () => {
    try {
      await submitUpdate(item.id);
      onRefresh?.();
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        className="text-blue-500 disabled:opacity-40 disabled:pointer-events-none"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        <Pencil className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar método de pago</DialogTitle>
            <DialogDescription>Modifica la información del método de pago.</DialogDescription>
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
              <PaymentMethodSharedForm
                mode="edit"
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={() => setOpen(false)}
                onSubmit={handleSubmit}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
