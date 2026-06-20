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

import ProductVariantSharedForm from "@/pages/dashboard/admin/product-variant/shared/ProductVariantSharedForm";

import { useUpdateProductVariant } from "../../hooks/useProductVariant";

export default function ProductVariantEditDialog({
  item,
  onRefresh,
  attributes = [],
  products = [],
  disabled = false,
}) {

  const [open, setOpen] = useState(false);

  const {
    form,
    handleChange,
    submitUpdate,
    loading,
    setInitialData,
  } = useUpdateProductVariant();

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
        disabled={disabled}
        title={disabled ? "Sin permiso para editar variantes" : undefined}
        onClick={() => setOpen(true)}
      >
        <UserPen className="w-4 h-4" />
      </Button>

      {/* MODAL */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >

        <DialogContent className="sm:max-w-4xl rounded-2xl">

          <DialogHeader>

            <DialogTitle>
              Editar variante
            </DialogTitle>

            <DialogDescription>
              Modifica la información de la variante.
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

              <ProductVariantSharedForm
                mode="edit"
                form={form}
                handleChange={handleChange}
                loading={loading}
                attributes={attributes}
                products={products}
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