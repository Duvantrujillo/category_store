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

import PromotionSharedForm from "../../shared/PromotionSharedForm";

import { useCreatePromotion } from "../../hooks/usePromotion";
import { useAllProduct } from "@/pages/dashboard/admin/product/hooks/useProduct";
import { useAllCategory } from "@/pages/dashboard/admin/category/hooks/useCategory";
import { useAllBrand } from "@/pages/dashboard/admin/brand/hooks/useBrand";
import { useAllProductVariant } from "@/pages/dashboard/admin/product-variant/hooks/useProductVariant";

export default function PromotionCreateDialog({
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
  } = useCreatePromotion();

  const { products } = useAllProduct({ skip: !open });
  const { categories } = useAllCategory({ skip: !open });
  const { brands } = useAllBrand({ skip: !open });
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
        title={disabled ? "Sin permiso para crear promociones" : undefined}
      >
        <Plus className="w-4 h-4" />
        Nueva promoción
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Crear promoción</DialogTitle>
            <DialogDescription>Agrega una nueva promoción al sistema.</DialogDescription>
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
              <PromotionSharedForm
                mode="create"
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={handleClose}
                onSubmit={handleSubmit}
                products={products}
                categories={categories}
                brands={brands}
                variants={variants}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
