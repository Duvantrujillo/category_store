import { useDeleteProduct } from "../../hooks/useProduct";

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

function DeleteProductDialog({
  open,
  onClose,
  productId,
  onDeleted,
}) {
  const {
    submitDelete,
    loading,
  } = useDeleteProduct();

  const handleDelete =
    async () => {
      if (!productId) return;

      try {
        await submitDelete(
          productId
        );

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
            ¿Eliminar producto?
          </DialogTitle>

          <DialogDescription>
            Esta acción no se puede
            deshacer.
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

export default DeleteProductDialog;