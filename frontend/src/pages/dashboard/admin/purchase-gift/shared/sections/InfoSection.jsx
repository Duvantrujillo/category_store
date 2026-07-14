import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
// primero se elige el producto, luego (si tiene más de una variante) cuál
// variante puntual se va a obsequiar. Mismo patrón que ItemsSection.jsx del
// módulo product-bundle, adaptado a una única selección en vez de una lista.
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

function VariantPicker({ variants = [], value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  const products = groupVariantsByProduct(variants);
  const selectedVariant = variants.find((v) => v.id === value) ?? null;

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery(""); }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = products.filter(
    (p) => !query.trim() || productLabel(p).toLowerCase().includes(query.trim().toLowerCase())
  );

  const selectProduct = (product) => {
    const isSingleVariant = product.variants.length === 1;
    onChange(isSingleVariant ? product.variants[0].id : product.variants[0]?.id ?? null, product);
    setQuery("");
    setOpen(false);
  };

  const clearSelection = () => onChange(null, null);

  const selectedProduct = selectedVariant
    ? products.find((p) => p.id === (selectedVariant.productId ?? selectedVariant.product?.id))
    : null;

  return (
    <div className="space-y-1.5">
      <Label>Producto a obsequiar <span className="text-red-400">*</span></Label>

      {selectedVariant ? (
        <div className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${error ? "border-destructive" : "border-slate-200"}`}>
          <div className="min-w-0">
            <p className="text-sm text-slate-700 truncate">
              {selectedProduct ? productLabel(selectedProduct) : (selectedVariant.product?.name ?? "Producto")}
            </p>
            {selectedProduct && selectedProduct.variants.length > 1 && (
              <select
                value={value ?? ""}
                onChange={(e) => onChange(Number(e.target.value), selectedProduct)}
                className="mt-1 h-7 rounded-md border border-slate-200 px-2 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-ring"
              >
                {selectedProduct.variants.map((v) => (
                  <option key={v.id} value={v.id}>{variantLabel(v)}</option>
                ))}
              </select>
            )}
          </div>
          <button type="button" onClick={clearSelection} className="shrink-0 text-rose-500 hover:text-rose-600 transition-colors">
            <X size={15} />
          </button>
        </div>
      ) : (
        <div ref={ref} className="relative">
          <div className={`flex items-center gap-2 h-9 border rounded-md px-3 focus-within:ring-1 focus-within:ring-ring ${error ? "border-destructive" : "border-slate-200"}`}>
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
                    onClick={() => selectProduct(product)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="truncate">{productLabel(product)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function InfoSection({ form, handleChange, variants = [], errors = {} }) {
  return (
    <div className="space-y-4">

      <div>
        <h3 className="text-sm font-semibold">Información del regalo</h3>
        <p className="text-xs text-muted-foreground">
          Nombre, monto mínimo de compra y qué producto se obsequia al alcanzarlo.
        </p>
      </div>

      {/* Nombre */}
      <div className="space-y-1.5">
        <Label>Nombre <span className="text-red-400">*</span></Label>
        <Input
          value={form.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Ej: Labial de regalo"
          maxLength={150}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <Label>
          Descripción{" "}
          <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
        </Label>
        <Textarea
          value={form.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Descripción interna del regalo"
          className="resize-none min-h-16"
          maxLength={500}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Compra mínima */}
        <div className="space-y-1.5">
          <Label>Compra mínima <span className="text-red-400">*</span></Label>
          <Input
            type="number"
            min={0}
            value={form.minimumPurchase ?? ""}
            onChange={(e) => handleChange("minimumPurchase", e.target.value)}
            placeholder="Ej: 100000"
            aria-invalid={!!errors.minimumPurchase}
          />
          {errors.minimumPurchase && <p className="text-xs text-destructive">{errors.minimumPurchase}</p>}
        </div>

        {/* Cantidad a obsequiar */}
        <div className="space-y-1.5">
          <Label>Cantidad a obsequiar</Label>
          <Input
            type="number"
            min={1}
            value={form.quantity ?? "1"}
            onChange={(e) => handleChange("quantity", e.target.value)}
          />
        </div>

      </div>

      {/* Producto + variante */}
      <VariantPicker
        variants={variants}
        value={form.productVariantId}
        onChange={(variantId) => handleChange("productVariantId", variantId)}
        error={errors.productVariantId}
      />

    </div>
  );
}
