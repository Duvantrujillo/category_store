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

import DiscountCodeSharedForm from "../../shared/DiscountCodeSharedForm";

import { useCreateDiscountCode } from "../../hooks/useDiscountCode";
import { useAllProduct } from "@/pages/dashboard/admin/product/hooks/useProduct";
import { useAllCategory } from "@/pages/dashboard/admin/category/hooks/useCategory";
import { useAllBrand } from "@/pages/dashboard/admin/brand/hooks/useBrand";

export default function DiscountCodeCreateDialog({
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
  } = useCreateDiscountCode();

  const { products } = useAllProduct({ skip: !open });
  const { categories } = useAllCategory({ skip: !open });
  const { brands } = useAllBrand({ skip: !open });

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
        title={disabled ? "Sin permiso para crear cupones" : undefined}
      >
        <Plus className="w-4 h-4" />
        Nuevo cupón
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Crear cupón de descuento</DialogTitle>
            <DialogDescription>Agrega un nuevo cupón al sistema.</DialogDescription>
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
              <DiscountCodeSharedForm
                mode="create"
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={handleClose}
                onSubmit={handleSubmit}
                products={products}
                categories={categories}
                brands={brands}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
