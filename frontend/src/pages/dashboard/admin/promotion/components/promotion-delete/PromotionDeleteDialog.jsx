import { useDeletePromotion } from "../../hooks/usePromotion";

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

function PromotionDeleteDialog({
  open,
  onClose,
  promotionId,
  onDeleted,
}) {
  const { submitDelete, loading } = useDeletePromotion();

  const handleDelete = async () => {
    if (!promotionId) return;

    try {
      await submitDelete(promotionId);
      onDeleted?.();
      onClose?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar promoción?</DialogTitle>
          <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>

          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PromotionDeleteDialog;
