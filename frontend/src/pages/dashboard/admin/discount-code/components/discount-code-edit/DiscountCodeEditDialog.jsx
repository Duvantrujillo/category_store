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

import DiscountCodeSharedForm from "../../shared/DiscountCodeSharedForm";

import { useUpdateDiscountCode } from "../../hooks/useDiscountCode";
import { useAllProduct } from "@/pages/dashboard/admin/product/hooks/useProduct";
import { useAllCategory } from "@/pages/dashboard/admin/category/hooks/useCategory";
import { useAllBrand } from "@/pages/dashboard/admin/brand/hooks/useBrand";

export default function DiscountCodeEditDialog({
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
  } = useUpdateDiscountCode();

  const { products } = useAllProduct({ skip: !open });
  const { categories } = useAllCategory({ skip: !open });
  const { brands } = useAllBrand({ skip: !open });

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
        title={disabled ? "Sin permiso para editar cupones" : undefined}
      >
        <UserPen className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar cupón</DialogTitle>
            <DialogDescription>Modifica la información del cupón.</DialogDescription>
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
              <DiscountCodeSharedForm
                mode="edit"
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={() => setOpen(false)}
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
