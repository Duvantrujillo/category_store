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

import BrandSharedForm from "@/pages/dashboard/admin/brand/shared/BrandSharedForm";

import { useUpdateBrand } from "../../hooks/useBrand";

export default function BrandEditDialog({
  item,
  onRefresh,
}) {

  const [open, setOpen] = useState(false);

  const {
    form,
    handleChange,
    submitUpdate,
    loading,
    setInitialData,
  } = useUpdateBrand();

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
        className="text-blue-500"
        onClick={() => setOpen(true)}
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
              Editar marca
            </DialogTitle>

            <DialogDescription>
              Modifica la información de la marca.
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

              <BrandSharedForm
                mode="edit"
                form={form}
                handleChange={handleChange}
                loading={loading}
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