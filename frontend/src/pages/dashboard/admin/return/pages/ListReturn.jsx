import { useState } from "react";

import { useAllReturn } from "../hooks/useReturn";
import ReturnTable from "../components/return-list/ReturnTable";
import ReturnItemsModal from "../components/return-detail/ReturnItemsModal";
import ReturnUpdateDialog from "../components/return-update/ReturnUpdateDialog";
import ReturnCreateDialog from "../components/return-create/ReturnCreateDialog";
import RefundModal from "../components/refund/RefundModal";

const ListReturn = () => {
  const { returns, loading, error, refetch } = useAllReturn();

  const [selected, setSelected] = useState(null);
  const [openItems, setOpenItems]   = useState(false);
  const [openEdit, setOpenEdit]     = useState(false);
  const [openRefund, setOpenRefund] = useState(false);

  const handleItems  = (item) => { setSelected(item); setOpenItems(true); };
  const handleEdit   = (item) => { setSelected(item); setOpenEdit(true); };
  const handleRefund = (item) => { setSelected(item); setOpenRefund(true); };

  const handleClose = (setter) => () => {
    setter(false);
    setSelected(null);
  };

  return (
    <>
      {/* BOTÓN CREAR */}
      <div className="flex justify-end mb-4">
        <ReturnCreateDialog onRefresh={refetch} />
      </div>

      <ReturnTable
        returns={returns}
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
    </>
  );
};

export default ListReturn;
