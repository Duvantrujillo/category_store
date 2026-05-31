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

import CategorySharedForm from "../../shared/CategorySharedForm";

import { useUpdateCategory } from "../../hooks/useCategory";

export default function CategoryEditDialog({
  item,
  categories = [],
  onRefresh,
}) {

  const [open, setOpen] = useState(false);
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const parentCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    if (!item?.id) return categories;

    return categories.filter(c => c.id !== item.id);
  }, [categories, item?.id]);

  const {
    form,
    handleChange,
    submitUpdate,
    loading,
    setInitialData,
  } = useUpdateCategory();

  /*
    🔥 INICIALIZAR FORM
    SOLO CUANDO ABRE EL MODAL
  */
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (open && item && !hasInitialized.current) {
      setInitialData(item);
      hasInitialized.current = true;
    }

    if (!open) {
      hasInitialized.current = false; // reset cuando se cierra
    }
  }, [open, item, setInitialData]);
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
              Editar categoría
            </DialogTitle>

            <DialogDescription>
              Modifica la información de la categoría.
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

              <CategorySharedForm
                mode="edit"
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={() => setOpen(false)}
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