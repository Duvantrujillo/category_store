import { useState, useMemo } from "react";
import { Inbox } from "lucide-react";

import AttributeValueCard from "./AttributeValueCard";
import DeleteAttributeValueDialog from "../attribute-value-delete/AttributeValueDeleteDialog";
import TablePagination from "@/components/ui/TablePagination";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function AttributeValueTable({ attributeValues, attributes, totalItems, page, pageSize, onPageChange, onRefresh }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const openConfirmModal  = (id) => { setSelectedId(id); setIsOpen(true); };
  const closeConfirmModal = ()   => { setSelectedId(null); setIsOpen(false); };

  // Group values by attribute name, preserving insertion order
  const grouped = useMemo(() => {
    if (!Array.isArray(attributeValues)) return [];
    const map = new Map();
    for (const item of attributeValues) {
      const key = item.attribute?.name ?? "Sin atributo";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return Array.from(map.entries()); // [[attributeName, [values]], ...]
  }, [attributeValues]);

  const hasData = grouped.length > 0;

  return (
    <>
      <Card className="rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Valores de atributos
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Agrupados por atributo · página actual
              </p>
            </div>
            <span className="text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full">
              {totalItems} registros
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {hasData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped.map(([attributeName, values]) => (
                <AttributeValueCard
                  key={attributeName}
                  attributeName={attributeName}
                  values={values}
                  attributes={attributes}
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

      <DeleteAttributeValueDialog
        open={isOpen}
        onClose={closeConfirmModal}
        attributeValueId={selectedId}
        onDeleted={onRefresh}
      />
    </>
  );
}

export default AttributeValueTable;
