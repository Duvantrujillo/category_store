import { useState } from "react";
import { Inbox } from "lucide-react";

import ProductBundleCard from "./ProductBundleCard";
import DeleteProductBundleDialog from "../product-bundle-delete/ProductBundleDeleteDialog";
import TablePagination from "@/components/ui/TablePagination";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function ProductBundleTable({ bundles, totalItems, page, pageSize, onPageChange, onRefresh }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const openConfirmModal  = (id) => { setSelectedId(id); setIsOpen(true); };
  const closeConfirmModal = ()   => { setSelectedId(null); setIsOpen(false); };

  return (
    <>
      <Card className="rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 overflow-hidden">

        {/* Encabezado */}
        <CardHeader className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Combos registrados
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Lista completa de combos de productos.</p>
            </div>
            <span className="text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full">
              {totalItems} registros
            </span>
          </div>
        </CardHeader>

        {/* Grid de cards */}
        <CardContent className="p-0">
          {Array.isArray(bundles) && bundles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-5">
              {bundles.map((item) => (
                <ProductBundleCard
                  key={item.id}
                  item={item}
                  onDelete={openConfirmModal}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Inbox size={32} className="opacity-40" />
              <span className="text-sm">No hay combos registrados.</span>
            </div>
          )}

          <TablePagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={onPageChange}
          />
        </CardContent>

      </Card>

      <DeleteProductBundleDialog
        open={isOpen}
        onClose={closeConfirmModal}
        bundleId={selectedId}
        onDeleted={onRefresh}
      />
    </>
  );
}

export default ProductBundleTable;
