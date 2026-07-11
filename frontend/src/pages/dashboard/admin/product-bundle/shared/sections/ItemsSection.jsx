import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Trash, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function variantLabel(variant) {
  if (!variant) return "Variante";
  const attrs = (variant.attributes ?? [])
    .map((a) => a.attributeValue?.value)
    .filter(Boolean)
    .join(" · ");
  return attrs || variant.sku || `Variante ${variant.id}`;
}

function productLabel(product) {
  const brand = product.brand ? `${product.brand} - ` : "";
  return `${brand}${product.name ?? "Producto"}`;
}

// Agrupa la lista plana de variantes (useAllProductVariant) por producto —
// el combo se arma eligiendo el producto, no la variante puntual.
function groupVariantsByProduct(variants) {
  const map = new Map();
  for (const v of variants) {
    const p = v.product;
    if (!p) continue;
    if (!map.has(p.id)) {
      map.set(p.id, { id: p.id, name: p.name, brand: p.brand?.name, variants: [] });
    }
    map.get(p.id).variants.push(v);
  }
  return [...map.values()];
}

const pillCls = (active) =>
  `text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
    active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
  }`;

export default function ItemsSection({ form, handleChange, variants = [], errors = {} }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  const products = useMemo(() => groupVariantsByProduct(variants), [variants]);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery(""); }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const items = form.items || [];
  const selectedIds = new Set(items.map((i) => i.productId));

  const filtered = products
    .filter((p) => !selectedIds.has(p.id))
    .filter((p) => !query.trim() || productLabel(p).toLowerCase().includes(query.trim().toLowerCase()));

  const addProduct = (product) => {
    const isSingleVariant = product.variants.length === 1;
    handleChange("items", [
      ...items,
      {
        productId: product.id,
        // Un solo producto sin variaciones reales: queda "fija" a esa única
        // variante, no tiene sentido preguntarle al cliente.
        productVariantId: isSingleVariant ? product.variants[0].id : null,
        quantity: 1,
        product,
      },
    ]);
    setQuery("");
    setOpen(false);
  };

  const removeProduct = (productId) => {
    handleChange("items", items.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    const qty = Math.max(1, Number(quantity) || 1);
    handleChange("items", items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)));
  };

  const setMode = (productId, mode) => {
    handleChange("items", items.map((i) => {
      if (i.productId !== productId) return i;
      if (mode === "free") return { ...i, productVariantId: null };
      const first = i.product.variants[0];
      return { ...i, productVariantId: first?.id ?? null };
    }));
  };

  const setFixedVariant = (productId, variantId) => {
    handleChange("items", items.map((i) => (i.productId === productId ? { ...i, productVariantId: Number(variantId) } : i)));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Productos del combo</h3>
        <p className="text-xs text-muted-foreground">
          Elige los productos que forman el combo. Si un producto tiene varias opciones (talla, color, etc.),
          decide si el <strong>cliente elige</strong> cuál quiere al comprar, o si dejas una <strong>variante fija</strong>.
        </p>
      </div>

      {/* Buscador para agregar */}
      <div ref={ref} className="relative">
        <div className="flex items-center gap-2 h-9 border border-slate-200 rounded-md px-3 focus-within:ring-1 focus-within:ring-ring">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            placeholder="Buscar producto por nombre o marca..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="px-3 py-3 text-xs text-muted-foreground text-center">Sin resultados</p>
              )}
              {filtered.slice(0, 30).map((product) => (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => addProduct(product)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="truncate">{productLabel(product)}</span>
                  <Plus size={13} className="text-indigo-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}

      {/* Lista de seleccionados */}
      {items.length === 0 ? (
        <p className={`text-xs border border-dashed rounded-lg py-6 text-center ${
          errors.items ? "border-destructive/40 text-destructive" : "border-slate-200 text-muted-foreground"
        }`}>
          Aún no agregas productos a este combo.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const hasMultipleVariants = item.product.variants.length > 1;
            const isFixed = item.productVariantId !== null;

            return (
              <div
                key={item.productId}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex-1 min-w-0 truncate text-sm text-slate-700">
                    {productLabel(item.product)}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Label className="text-[11px] text-muted-foreground">Cant.</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, e.target.value)}
                      className="w-16 h-8"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeProduct(item.productId)}
                    className="shrink-0 text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <Trash size={14} />
                  </button>
                </div>

                {hasMultipleVariants && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => setMode(item.productId, "free")} className={pillCls(!isFixed)}>
                      Cliente elige
                    </button>
                    <button type="button" onClick={() => setMode(item.productId, "fixed")} className={pillCls(isFixed)}>
                      Variante fija
                    </button>

                    {isFixed && (
                      <select
                        value={item.productVariantId ?? ""}
                        onChange={(e) => setFixedVariant(item.productId, e.target.value)}
                        className="h-8 rounded-md border border-slate-200 px-2 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-ring"
                      >
                        {item.product.variants.map((v) => (
                          <option key={v.id} value={v.id}>{variantLabel(v)}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
