import { useDeleteBanner } from "../../hooks/useBanner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogClose, DialogContent,
  DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function BannerDeleteDialog({ open, onClose, bannerId, onDeleted }) {
  const { submitDelete, loading } = useDeleteBanner();

  async function handleDelete() {
    if (!bannerId) return;
    try {
      await submitDelete(bannerId);
      onDeleted?.();
      onClose?.();
    } catch { /* toast ya muestra el error */ }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar banner?</DialogTitle>
          <DialogDescription>
            Se eliminará el banner y su imagen. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
