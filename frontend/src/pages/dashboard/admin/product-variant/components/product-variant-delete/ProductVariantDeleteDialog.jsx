import { useDeleteProductVariant } from "../../hooks/useProductVariant";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function DeleteProductVariantDialog({
  open,
  onClose,
  variantId,
  onDeleted,
}) {

  const {
    submitDelete,
    loading,
  } = useDeleteProductVariant();

  const handleDelete = async () => {

    if (!variantId) return;

    try {

      await submitDelete(variantId);

      onDeleted?.();

      onClose?.();

    } catch (error) {

      console.error(error);

    }

  };

  return (

    <Dialog
      open={open}
      onOpenChange={onClose}
    >

      <DialogContent>

        <DialogHeader>

          <DialogTitle>
            ¿Eliminar variante?
          </DialogTitle>

          <DialogDescription>
            Esta acción no se puede deshacer.
          </DialogDescription>

        </DialogHeader>

        <DialogFooter>

          <DialogClose asChild>

            <Button variant="outline">
              Cancelar
            </Button>

          </DialogClose>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >

            {loading
              ? "Eliminando..."
              : "Eliminar"}

          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>

  );

}

export default DeleteProductVariantDialog;