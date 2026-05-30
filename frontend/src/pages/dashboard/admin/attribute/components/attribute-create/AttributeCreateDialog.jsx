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

import AttributeSharedForm from "../../shared/AttributeSharedForm";

import { useCreateAttribute } from "../../hooks/useAttribute";

export default function AttributeCreateDialog({
  onRefresh,
}) {

  const [open, setOpen] = useState(false);

  /*
    🔥 HOOK CREATE
  */

  const {
    form,
    handleChange,
    submitCreate,
    loading,
    resetForm,
  } = useCreateAttribute();

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

        Nuevo atributo

      </Button>

      {/* MODAL */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >

        <DialogContent className="sm:max-w-2xl rounded-2xl">

          <DialogHeader>

            <DialogTitle>
              Crear atributo
            </DialogTitle>

            <DialogDescription>
              Agrega un nuevo atributo al sistema.
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

              <AttributeSharedForm
                mode="create"
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={handleClose}
                onSubmit={handleSubmit}
              />

            )

          )}

        </DialogContent>

      </Dialog>

    </>
  );
}