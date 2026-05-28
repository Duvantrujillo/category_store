import { useDeleteCategory } from "../../hooks/useCategory";

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

function DeleteCategoryDialog({
  open,
  onClose,
  categoryId,
  onDeleted,
}) {

  const { submitDelete, loading } =
    useDeleteCategory();

  const handleDelete = async () => {

    if (!categoryId) return;

    try {

      await submitDelete(categoryId);

      onDeleted();

      onClose();

    } catch (error) {

      console.error(error);

    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>

      <DialogContent>

        <DialogHeader>

          <DialogTitle>
            ¿Eliminar categoría?
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

            {loading ? "Eliminando..." : "Eliminar"}

          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>
  );
}

export default DeleteCategoryDialog;