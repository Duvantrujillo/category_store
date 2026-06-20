import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllReturn } from "../hooks/useReturn";
import { useHasPermission } from "@/lib/permissions";

import ReturnTable from "../components/return-list/ReturnTable";
import ReturnCreateDialog from "../components/return-create/ReturnCreateDialog";
import ReturnItemsModal from "../components/return-detail/ReturnItemsModal";
import ReturnUpdateDialog from "../components/return-update/ReturnUpdateDialog";
import RefundModal from "../components/refund/RefundModal";

const PAGE_SIZE = 15;

const ListReturn = () => {
  const canView   = useHasPermission("returns.view");
  const canCreate = useHasPermission("returns.approve");
  const { returns = [], refetch } = useAllReturn({ skip: !canView });

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(returns.length / PAGE_SIZE));
  const paginatedReturns = returns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const [selected, setSelected]     = useState(null);
  const [openItems, setOpenItems]   = useState(false);
  const [openEdit, setOpenEdit]     = useState(false);
  const [openRefund, setOpenRefund] = useState(false);

  const handleItems  = (item) => { setSelected(item); setOpenItems(true); };
  const handleEdit   = (item) => { setSelected(item); setOpenEdit(true); };
  const handleRefund = (item) => { setSelected(item); setOpenRefund(true); };
  const handleClose  = (setter) => () => { setter(false); setSelected(null); };

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <ShieldOff size={40} className="opacity-40" />
        <p className="text-sm">No tienes permisos para visualizar esta sección.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-end">
        <ReturnCreateDialog onRefresh={refetch} disabled={!canCreate} />
      </div>

      <ReturnTable
        returns={paginatedReturns}
        totalItems={returns.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onItems={handleItems}
        onEdit={handleEdit}
        onRefund={handleRefund}
      />

      <ReturnItemsModal
        open={openItems}
        item={selected}
        onClose={handleClose(setOpenItems)}
      />
      <ReturnUpdateDialog
        open={openEdit}
        item={selected}
        onClose={handleClose(setOpenEdit)}
        onRefresh={refetch}
      />
      <RefundModal
        open={openRefund}
        item={selected}
        onClose={handleClose(setOpenRefund)}
        onRefresh={refetch}
      />
    </div>
  );
};

export default ListReturn;
