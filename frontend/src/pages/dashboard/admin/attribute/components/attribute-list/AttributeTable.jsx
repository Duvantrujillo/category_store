import { useState } from "react";
import { Inbox } from "lucide-react";

import AttributeCard from "./AttributeCard";
import DeleteAttributeDialog from "../attribute-delete/AttributeDeleteDialog";
import TablePagination from "@/components/ui/TablePagination";
import CardGridSkeleton from "@/components/ui/CardGridSkeleton";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function AttributeTable({ attributes, loading, totalItems, page, pageSize, onPageChange, onRefresh }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const openConfirmModal  = (id) => { setSelectedId(id); setIsOpen(true); };
  const closeConfirmModal = ()   => { setSelectedId(null); setIsOpen(false); };

  return (
    <>
      <Card className="rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Atributos registrados
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Lista completa de atributos.</p>
            </div>
            <span className="text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full">
              {totalItems} registros
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {loading ? (
            <CardGridSkeleton
              hasImage={false}
              gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            />
          ) : Array.isArray(attributes) && attributes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {attributes.map((item) => (
                <AttributeCard
                  key={item.id}
                  item={item}
                  onDelete={openConfirmModal}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
              <Inbox size={36} className="opacity-40" />
              <span className="text-sm">No hay registros.</span>
            </div>
          )}

          <div className="mt-6">
            <TablePagination page={page} pageSize={pageSize} totalItems={totalItems} onPageChange={onPageChange} />
          </div>
        </CardContent>
      </Card>

      <DeleteAttributeDialog
        open={isOpen}
        onClose={closeConfirmModal}
        attributeId={selectedId}
        onDeleted={onRefresh}
      />
    </>
  );
}

export default AttributeTable;
