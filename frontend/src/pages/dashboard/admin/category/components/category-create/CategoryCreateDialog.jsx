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

import CategorySharedForm from "../../shared/CategorySharedForm";

import { useCreateCategory } from "../../hooks/useCategory";

export default function CategoryCreateDialog({
  categories = [],
  onRefresh,
  disabled = false,
}) {

  const [open, setOpen] = useState(false);

  /*
    🔥 SOLO CATEGORÍAS VÁLIDAS
    Máximo 2 niveles: solo categorías raíz (sin padre propio) pueden
    elegirse como padre, para no crear nietos.
  */
  const parentCategories = useMemo(() => {

    if (!Array.isArray(categories)) return [];

    return categories.filter((c) => !c.parentId);

  }, [categories]);

  /*
    🔥 HOOK CREATE
  */
  const {
    form,
    handleChange,
    submitCreate,
    loading,
    resetForm,
  } = useCreateCategory();

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
        title={disabled ? "Sin permiso para crear categorías" : undefined}
      >
        <Plus className="w-4 h-4" />
        Nueva categoría
      </Button>

      {/* MODAL */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >

        <DialogContent className="sm:max-w-2xl rounded-2xl">

          <DialogHeader>

            <DialogTitle>
              Crear categoría
            </DialogTitle>

            <DialogDescription>
              Agrega una nueva categoría al sistema.
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

              <CategorySharedForm
                mode="create"
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={handleClose}
                onSubmit={handleSubmit}
                categories={parentCategories}
              />

            )

          )}

        </DialogContent>

      </Dialog>

    </>
  );
}