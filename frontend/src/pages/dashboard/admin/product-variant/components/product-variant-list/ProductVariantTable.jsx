import { useState } from "react";
import { Inbox } from "lucide-react";

import ProductVariantCard from "./ProductVariantCard";
import ProductVariantDetailsModal from "./ProductVariantDetailsModal";
import DeleteProductVariantDialog from "../product-variant-delete/ProductVariantDeleteDialog";
import TablePagination from "@/components/ui/TablePagination";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ProductVariantTable({ variants, totalItems, page, pageSize, onPageChange, onRefresh, products = [], attributes = [] }) {
  const [deleteId, setDeleteId]           = useState(null);
  const [detailVariant, setDetailVariant] = useState(null);

  const isEmpty = !Array.isArray(variants) || variants.length === 0;

  return (
    <>
      <Card className="rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Variantes registradas
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Lista completa de variantes del producto.</p>
            </div>
            <span className="text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full">
              {totalItems} registros
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {!isEmpty ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-5">
              {variants.map((item) => (
                <ProductVariantCard
                  key={item.id}
                  item={item}
                  onDelete={(id) => setDeleteId(id)}
                  onDetails={(v) => setDetailVariant(v)}
                  onRefresh={onRefresh}
                  products={products}
                  attributes={attributes}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 py-16">
              <Inbox size={36} className="opacity-40" />
              <span className="text-sm">No hay registros.</span>
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

      <DeleteProductVariantDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        variantId={deleteId}
        onDeleted={onRefresh}
      />

      <ProductVariantDetailsModal
        open={!!detailVariant}
        onClose={() => setDetailVariant(null)}
        variant={detailVariant}
      />
    </>
  );
}

export default ProductVariantTable;
