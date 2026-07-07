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

import ProductBundleSharedForm from "../../shared/ProductBundleSharedForm";

import { useCreateProductBundle } from "../../hooks/useProductBundle";
import { useAllProductVariant } from "@/pages/dashboard/admin/product-variant/hooks/useProductVariant";

export default function ProductBundleCreateDialog({
  onRefresh,
  disabled = false,
}) {

  const [open, setOpen] = useState(false);

  const { variants } = useAllProductVariant({ skip: !open });

  /*
    🔥 HOOK CREATE
  */

  const {
    form,
    handleChange,
    submitCreate,
    loading,
    resetForm,
  } = useCreateProductBundle();

  /*
    🔥 SUBMIT
  */

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

  /*
    🔥 CERRAR MODAL
  */

  const handleClose = () => {

    setOpen(false);

    resetForm();

  };

  return (
    <>

      {/* BOTÓN CREAR */}
      <Button
        onClick={() => setOpen(true)}
        className="gap-2"
        disabled={disabled}
      >

        <Plus className="w-4 h-4" />

        Nuevo combo

      </Button>

      {/* MODAL */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >

        <DialogContent className="sm:max-w-2xl rounded-2xl">

          <DialogHeader>

            <DialogTitle>
              Crear combo
            </DialogTitle>

            <DialogDescription>
              Agrega un nuevo combo de productos al sistema.
            </DialogDescription>

          </DialogHeader>

          {/* FORM */}
          {open && (

            loading ? (

              <div className="flex flex-col items-center gap-10">

                <Button
                  variant="outline"
                  disabled
                  size="sm"
                >

                  <Spinner data-icon="inline-start" />

                  Guardando...

                </Button>

              </div>

            ) : (

              <ProductBundleSharedForm
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
