import { useState, useEffect, useRef, useMemo } from "react";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { UserPen } from "lucide-react";

import AttributeValueSharedForm from "../../shared/AttributeValueSharedForm";

import { useUpdateAttributeValue } from "../../hooks/useAttributeValue";

export default function AttributeValueEditDialog({
  item,
  attributes = [],
  onRefresh,
  disabled = false,
}) {

  const [open, setOpen] =
    useState(false);

  const availableAttributes =
    useMemo(() => {

      if (!Array.isArray(attributes))
        return [];

      return attributes;

    }, [attributes]);

  const {
    form,
    handleChange,
    submitUpdate,
    loading,
    setInitialData,
  } = useUpdateAttributeValue();

  /*
    🔥 INICIALIZAR FORM
    SOLO CUANDO ABRE EL MODAL
  */
  const hasInitialized =
    useRef(false);

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
              Editar valor de atributo
            </DialogTitle>

            <DialogDescription>
              Modifica la información del valor.
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

              <AttributeValueSharedForm
                mode="edit"
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={() => setOpen(false)}
                onSubmit={handleSubmit}
                attributes={availableAttributes}
              />

            )

          )}

        </DialogContent>

      </Dialog>

    </>
  );

}