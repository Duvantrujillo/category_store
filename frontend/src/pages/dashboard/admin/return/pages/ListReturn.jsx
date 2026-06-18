import { useEffect, useState } from "react";

import { useAllReturn } from "../hooks/useReturn";

import ReturnTable from "../components/return-list/ReturnTable";
import ReturnCreateDialog from "../components/return-create/ReturnCreateDialog";
import ReturnItemsModal from "../components/return-detail/ReturnItemsModal";
import ReturnUpdateDialog from "../components/return-update/ReturnUpdateDialog";
import RefundModal from "../components/refund/RefundModal";

const PAGE_SIZE = 15;

const ListReturn = () => {
  const { returns = [], refetch } = useAllReturn();

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

  return (
    <div className="space-y-6 p-6">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Devoluciones</h1>
          <p className="text-muted-foreground">Administra las solicitudes de devolución y reembolso.</p>
        </div>
        <ReturnCreateDialog onRefresh={refetch} />
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
