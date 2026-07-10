import { useDeleteCancelledOrders } from "../../hooks/useOrder";
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

export default function CancelledOrdersDeleteDialog({ open, onClose, count, onDeleted }) {
  const { submitDelete, loading } = useDeleteCancelledOrders();

  async function handleDelete() {
    try {
      await submitDelete();
      onDeleted?.();
      onClose?.();
    } catch {
      /* toast ya muestra el error */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar órdenes canceladas antiguas?</DialogTitle>
          <DialogDescription>
            Se eliminarán permanentemente {count} orden{count === 1 ? "" : "es"} cancelada{count === 1 ? "" : "s"} con
            más de 15 días de antigüedad, junto con todo lo asociado (productos, pagos, envíos). Las canceladas más
            recientes y las órdenes con cualquier otro estado no se tocan. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={loading || count === 0}>
            {loading ? "Eliminando…" : `Eliminar (${count})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
