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

import PurchaseGiftSharedForm from "../../shared/PurchaseGiftSharedForm";

import { useCreatePurchaseGift } from "../../hooks/usePurchaseGift";
import { useAllProductVariant } from "@/pages/dashboard/admin/product-variant/hooks/useProductVariant";

export default function PurchaseGiftCreateDialog({
  onRefresh,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  const {
    form,
    handleChange,
    submitCreate,
    loading,
    resetForm,
  } = useCreatePurchaseGift();

  const { variants } = useAllProductVariant({ skip: !open });

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
      <Button
        onClick={() => setOpen(true)}
        className="gap-2"
        disabled={disabled}
        title={disabled ? "Sin permiso para crear regalos" : undefined}
      >
        <Plus className="w-4 h-4" />
        Nuevo regalo
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Crear regalo por monto de compra</DialogTitle>
            <DialogDescription>Agrega un nuevo regalo al sistema.</DialogDescription>
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
              <PurchaseGiftSharedForm
                mode="create"
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={handleClose}
                onSubmit={handleSubmit}
                variants={variants}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
