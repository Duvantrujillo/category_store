import { useState } from "react";
import { Inbox, Trash } from "lucide-react";

import noPhotos from "@/assets/icons/no-fotos.png";
import ProductVariantRow from "./ProductVariantRow";
import DeleteProductVariantDialog from "../product-variant-delete/ProductVariantDeleteDialog";
import ProductVariantEditDialog from "@/pages/dashboard/admin/product-variant/components/product-variant-update/ProductVariantEditDialog";

import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function ProductVariantTable({ variants, onRefresh, products = [], attributes = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const openConfirmModal  = (id) => { setSelectedId(id); setIsOpen(true); };
  const closeConfirmModal = ()   => { setSelectedId(null); setIsOpen(false); };

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
              {Array.isArray(variants) ? variants.length : 0} registros
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">

          {/* ── Desktop: tabla normal ── */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  {["Imagen","SKU","Precio","Stock","Principal","Estado","Acciones"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 text-center whitespace-nowrap">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {!isEmpty ? (
                  variants.map((item) => (
                    <ProductVariantRow
                      key={item.id}
                      item={item}
                      onDelete={openConfirmModal}
                      onRefresh={onRefresh}
                      products={products}
                      attributes={attributes}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
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

          {/* ── Mobile: lista de tarjetas ── */}
          <div className="md:hidden divide-y divide-slate-100">
            {!isEmpty ? (
              variants.map((item) => (
                <div key={item.id} className="flex items-start gap-3 px-4 py-4">
                  <img
                    src={item.images?.[0]?.imageUrl
                      ? `${import.meta.env.VITE_API_URL}${item.images[0].imageUrl}`
                      : noPhotos
                    }
                    alt={item.sku || "Sin imagen"}
                    className="h-14 w-14 rounded-lg object-cover border border-slate-200 shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{item.sku}</p>
                    <p className="text-xs text-slate-400 truncate">{item.barcode || "Sin código"}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-sm font-semibold text-slate-700">
                        ${Number(item.price).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500">Stock: {item.stock}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.isDefault ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {item.isDefault ? "Principal" : "Secundaria"}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {item.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <ProductVariantEditDialog
                      item={item}
                      onRefresh={onRefresh}
                      products={products}
                      attributes={attributes}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => openConfirmModal(item.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-32 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Inbox size={30} className="opacity-40" />
                <span className="text-sm">No hay registros.</span>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      <DeleteProductVariantDialog
        open={isOpen}
        onClose={closeConfirmModal}
        variantId={selectedId}
        onDeleted={onRefresh}
      />
    </>
  );
}

export default ProductVariantTable;
