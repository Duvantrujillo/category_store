import { useState, useMemo } from "react";
import { X, Check, PackageX } from "lucide-react";
import { getBundleAvailableStock } from "../../hooks/usePublicCart";
import { getAvailableUnits } from "@/lib/stock";

function variantLabel(variant) {
  if (!variant) return "";
  const attrs = (variant.attributes ?? [])
    .map((a) => a.attributeValue?.value)
    .filter(Boolean)
    .join(" · ");
  return attrs || variant.sku || `Variante ${variant.id}`;
}

export default function BundleVariantSelectorModal({ bundle, onClose, onConfirm }) {
  const freeItems = useMemo(() => bundle.items.filter((item) => !item.productVariantId), [bundle]);

  const [selections, setSelections] = useState(() => {
    const initial = {};
    for (const item of freeItems) {
      // Solo se preselecciona una opción que realmente alcance para el combo
      // (stock disponible suficiente para la cantidad que pide la receta),
      // no cualquiera.
      const firstUsable = item.product.variants.find((v) => getAvailableUnits(v) >= item.quantity)
        ?? item.product.variants[0];
      if (firstUsable) initial[item.id] = firstUsable.id;
    }
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const available = useMemo(() => getBundleAvailableStock(bundle, selections), [bundle, selections]);
  const missingSelection = freeItems.some((item) => !selections[item.id]);

  async function handleConfirm() {
    if (missingSelection || available <= 0 || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await onConfirm(selections);
      if (result?.ok === false) {
        setError(result.message ?? "No se pudo agregar el combo");
        return;
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-rose-400">Configura tu combo</p>
            <h2 className="text-sm font-bold text-gray-900">{bundle.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Componentes */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {bundle.items.map((item, idx) => {
            const isFree = !item.productVariantId;
            const fixedOutOfStock = !isFree && getAvailableUnits(item.productVariant) < item.quantity;

            return (
              <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-3 flex flex-col gap-2.5 shadow-sm">
                {/* Encabezado del producto — número + nombre, para que quede claro a cuál pertenece cada selección */}
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-50 text-rose-500 text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {item.product.name}
                  </p>
                  <span className="text-[11px] text-gray-400 font-medium shrink-0 ml-auto">× {item.quantity}</span>
                </div>

                {isFree ? (
                  <div className="flex flex-col gap-1.5 pl-7">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Elige una opción</p>
                    {item.product.variants.map((variant) => {
                      const selected = selections[item.id] === variant.id;
                      // Agotado = no alcanza el stock disponible para la
                      // cantidad que este combo necesita de esta variante.
                      const outOfStock = getAvailableUnits(variant) < item.quantity;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          disabled={outOfStock}
                          onClick={() => setSelections((prev) => ({ ...prev, [item.id]: variant.id }))}
                          className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                            selected
                              ? "border-rose-300 bg-rose-50"
                              : outOfStock
                              ? "border-gray-100"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className={outOfStock ? "text-gray-400" : "text-gray-700"}>
                            {variantLabel(variant)}
                          </span>
                          {outOfStock ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-400 shrink-0">
                              <PackageX size={11} /> Agotado
                            </span>
                          ) : selected ? (
                            <Check size={13} className="text-rose-500 shrink-0" />
                          ) : null}
                        </button>
                      );
                    })}
                    {item.product.variants.length === 0 && (
                      <p className="text-[11px] text-rose-500">No hay opciones disponibles para este producto.</p>
                    )}
                  </div>
                ) : (
                  <div className="pl-7">
                    <div
                      className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${
                        fixedOutOfStock ? "border-gray-100 bg-gray-50" : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <span className={fixedOutOfStock ? "text-gray-400" : "text-gray-600"}>
                        {variantLabel(item.productVariant)}
                      </span>
                      {fixedOutOfStock && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-400 shrink-0">
                          <PackageX size={11} /> Agotado
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2">
          {available <= 0 && (
            <p className="text-[11px] text-rose-500 font-medium text-center">
              Agotado con esta configuración.
            </p>
          )}
          {error && (
            <p className="text-[11px] text-rose-500 font-medium text-center">{error}</p>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={missingSelection || available <= 0 || submitting}
            className="w-full h-11 rounded-xl flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold tracking-widest uppercase transition-colors"
          >
            {submitting ? "Agregando..." : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}
