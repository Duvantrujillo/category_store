import { useState, useMemo } from "react";

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

import AttributeValueSharedForm from "../../shared/AttributeValueSharedForm";

import { useCreateAttributeValue } from "../../hooks/useAttributeValue";

export default function AttributeValueCreateDialog({
  attributes = [],
  onRefresh,
}) {

  const [open, setOpen] =
    useState(false);

  /*
    🔥 SOLO ATRIBUTOS VÁLIDOS
  */
  const availableAttributes =
    useMemo(() => {

      if (!Array.isArray(attributes))
        return [];

      return attributes;

    }, [attributes]);

  /*
    🔥 HOOK CREATE
  */
  const {
    form,
    handleChange,
    submitCreate,
    loading,
    resetForm,
  } = useCreateAttributeValue();

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
      >
        <Plus className="w-4 h-4" />

        Nuevo valor
      </Button>

      {/* MODAL */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >

        <DialogContent className="sm:max-w-2xl rounded-2xl">

          <DialogHeader>

            <DialogTitle>
              Crear valor de atributo
            </DialogTitle>

            <DialogDescription>
              Agrega un nuevo valor para un atributo.
            </DialogDescription>

          </DialogHeader>

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

              <AttributeValueSharedForm
                mode="create"
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={handleClose}
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