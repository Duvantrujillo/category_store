import { useState } from "react";
import { Inbox } from "lucide-react";

import ProductCard from "./ProductCard";
import ProductDetailsModal from "./ProductDetailsModal";
import DeleteProductDialog from "../product-delete/ProductDeleteDialog";
import TablePagination from "@/components/ui/TablePagination";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ProductTable({ products, totalItems, page, pageSize, onPageChange, onRefresh }) {
  const [deleteId, setDeleteId]           = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  return (
    <>
      <Card className="rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Productos registrados
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Lista completa de productos.</p>
            </div>
            <span className="text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full">
              {totalItems} registros
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {Array.isArray(products) && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-5">
              {products.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onDelete={(id) => setDeleteId(id)}
                  onDetails={(p) => setDetailProduct(p)}
                  onRefresh={onRefresh}
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

      <DeleteProductDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        productId={deleteId}
        onDeleted={onRefresh}
      />

      <ProductDetailsModal
        open={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        product={detailProduct}
      />
    </>
  );
}

export default ProductTable;
