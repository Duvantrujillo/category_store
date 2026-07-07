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

import ProductBundleSharedForm from "@/pages/dashboard/admin/product-bundle/shared/ProductBundleSharedForm";

import { useUpdateProductBundle } from "../../hooks/useProductBundle";
import { useAllProductVariant } from "@/pages/dashboard/admin/product-variant/hooks/useProductVariant";

export default function ProductBundleEditDialog({
  item,
  onRefresh,
  disabled = false,
}) {

  const [open, setOpen] = useState(false);

  const { variants } = useAllProductVariant({ skip: !open });

  const {
    form,
    handleChange,
    submitUpdate,
    loading,
    setInitialData,
  } = useUpdateProductBundle();

  /*
    🔥 INICIALIZAR FORM
    SOLO CUANDO ABRE EL MODAL
  */

  const hasInitialized = useRef(false);

  useEffect(() => {

    if (
      open &&
      item &&
      !hasInitialized.current
    ) {

      setInitialData(item);

      hasInitialized.current = true;

    }

    if (!open) {

      hasInitialized.current = false;

    }

  }, [
    open,
    item,
    setInitialData,
  ]);

  /*
    🔥 SUBMIT
  */

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

      {/* BOTÓN EDITAR */}
      <Button
        variant="secondary"
        size="icon"
        className="text-blue-500 disabled:opacity-40 disabled:pointer-events-none"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >

        <UserPen className="w-4 h-4" />

      </Button>

      {/* MODAL */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >

        <DialogContent className="sm:max-w-2xl rounded-2xl">

          <DialogHeader>

            <DialogTitle>
              Editar combo
            </DialogTitle>

            <DialogDescription>
              Modifica la información del combo.
            </DialogDescription>

          </DialogHeader>

          {/* FORMULARIO */}
          {open && (

            loading ? (

              <div className="flex flex-col items-center gap-10">

                <Button
                  variant="outline"
                  disabled
                  size="sm"
                >

                  <Spinner data-icon="inline-start" />

                  Cargando...

                </Button>

              </div>

            ) : (

              <ProductBundleSharedForm
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
