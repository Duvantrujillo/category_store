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

import { UserPen } from "lucide-react";

import PurchaseGiftSharedForm from "../../shared/PurchaseGiftSharedForm";

import { useUpdatePurchaseGift } from "../../hooks/usePurchaseGift";
import { useAllProductVariant } from "@/pages/dashboard/admin/product-variant/hooks/useProductVariant";

export default function PurchaseGiftEditDialog({
  item,
  onRefresh,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  const {
    form,
    handleChange,
    submitUpdate,
    loading,
    setInitialData,
  } = useUpdatePurchaseGift();

  const { variants } = useAllProductVariant({ skip: !open });

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (open && item && !hasInitialized.current) {
      setInitialData(item);
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
        title={disabled ? "Sin permiso para editar regalos" : undefined}
      >
        <UserPen className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar regalo</DialogTitle>
            <DialogDescription>Modifica la información del regalo.</DialogDescription>
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
              <PurchaseGiftSharedForm
                mode="edit"
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={() => setOpen(false)}
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
