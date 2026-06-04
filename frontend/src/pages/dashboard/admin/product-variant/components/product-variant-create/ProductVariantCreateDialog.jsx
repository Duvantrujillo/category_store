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

import ProductVariantSharedForm from "../../shared/ProductVariantSharedForm";
import { useCreateProductVariant } from "../../hooks/useProductVariant";

export default function ProductVariantCreateDialog({
  onRefresh,
  productId,
  products = [],
  attributes = [],
}) {
  const [open, setOpen] = useState(false);

  const initialForm = {
    barcode: "",
    price: "",
    stock: "",
    isDefault: false,
    isActive: true,
    attributes: [],
    images: [null, null, null, null],
    mainImage: null,
  };

  const [form, setForm] = useState(initialForm);

  const { submitCreate, loading } = useCreateProductVariant();

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (formData) => {
    try {
      if (productId) {
        formData.append("productId", productId);
      }

      await submitCreate(formData);

      onRefresh?.();

      setForm(initialForm); // reset
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Nueva variante
      </Button>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) setForm(initialForm);
        }}
      >
        <DialogContent className="sm:max-w-4xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Crear variante</DialogTitle>
            <DialogDescription>
              Agrega una nueva variante al producto.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex flex-col items-center gap-10">
              <Button variant="outline" disabled size="sm">
                <Spinner data-icon="inline-start" />
                Guardando...
              </Button>
            </div>
          ) : (
            <ProductVariantSharedForm
              mode="create"
              form={form}
              handleChange={handleChange}
              loading={loading}
              onCancel={handleClose}
              onSubmit={() => {
                const fd = new FormData();

                // append mainImage first if provided (so it becomes slot 1)
                if (form.mainImage instanceof File) {
                  fd.append("images", form.mainImage);
                }

                // append gallery images in order (skip empty / non-files)
                (form.images || []).forEach((file) => {
                  if (file instanceof File) fd.append("images", file);
                });

                // append other fields
                Object.entries(form).forEach(([key, value]) => {
                  if (key === "images" || key === "mainImage") return;
                  if (key === "attributes") {
                    fd.append(key, JSON.stringify(value));
                  } else {
                    fd.append(key, value);
                  }
                });

                handleSubmit(fd);
              }}
              products={products}
              attributes={attributes}
              productId={productId}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}