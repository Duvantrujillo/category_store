import { useState } from "react";
import { Inbox } from "lucide-react";

import AttributeValueRow from "./AttributeValueRow";
import DeleteAttributeValueDialog from "../attribute-value-delete/AttributeValueDeleteDialog";

import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function AttributeValueTable({ attributeValues, attributes, onRefresh }) {
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
                Valores de atributos
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Lista completa de valores de atributos.</p>
            </div>
            <span className="text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full">
              {Array.isArray(attributeValues) ? attributeValues.length : 0} registros
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  {["Atributo","Valor","Acciones"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 text-center whitespace-nowrap">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.isArray(attributeValues) && attributeValues.length > 0 ? (
                  attributeValues.map((item) => (
                    <AttributeValueRow
                      key={item.id}
                      item={item}
                      attributes={attributes}
                      onDelete={openConfirmModal}
                      onRefresh={onRefresh}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Inbox size={30} className="opacity-40" />
                        <span className="text-sm">No hay registros.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
