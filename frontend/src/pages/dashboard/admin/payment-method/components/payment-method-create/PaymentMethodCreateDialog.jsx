import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import PaymentMethodSharedForm from "../../shared/PaymentMethodSharedForm";
import { useCreatePaymentMethod } from "../../hooks/usePaymentMethod";

export default function PaymentMethodCreateDialog({ onRefresh, disabled = false }) {
  const [open, setOpen] = useState(false);
  const { form, handleChange, submitCreate, loading, resetForm } = useCreatePaymentMethod();

  const handleSubmit = async () => {
    try {
      await submitCreate();
      onRefresh?.();
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2" disabled={disabled}>
        <Plus className="w-4 h-4" />
        Nuevo método de pago
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Crear método de pago</DialogTitle>
            <DialogDescription>Agrega un nuevo método de pago a la tienda.</DialogDescription>
          </DialogHeader>

          {open && (
            loading ? (
              <div className="flex flex-col items-center gap-10">
                <Button variant="outline" disabled size="sm">
                  <Spinner data-icon="inline-start" />
                  Guardando...
                </Button>
              </div>
            ) : (
              <PaymentMethodSharedForm
                mode="create"
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={handleClose}
                onSubmit={handleSubmit}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
