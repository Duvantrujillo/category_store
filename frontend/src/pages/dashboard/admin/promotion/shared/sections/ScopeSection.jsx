import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import MultiSelectField from "../MultiSelectField";

const SCOPE_OPTIONS = [
  { value: "ALL_PRODUCTS", label: "Todo el catálogo" },
  { value: "PRODUCTS",     label: "Productos específicos" },
  { value: "CATEGORIES",   label: "Categorías" },
  { value: "BRANDS",       label: "Marcas" },
];

const variantLabel = (v) => `${v.product?.name ?? ""}${v.sku ? ` (${v.sku})` : ""}`.trim();

export default function ScopeSection({
  form,
  handleChange,
  products = [],
  categories = [],
  brands = [],
  variants = [],
}) {
  const scope = form.scope || "ALL_PRODUCTS";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Alcance</h3>
        <p className="text-xs text-muted-foreground">
          Define a qué parte del catálogo aplica la promoción. Si eliges <strong>productos específicos</strong>,
          puedes además afinar a variantes puntuales de esos productos.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Aplica a <span className="text-red-400">*</span></Label>
        <Select value={scope} onValueChange={(val) => handleChange("scope", val)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCOPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {scope === "PRODUCTS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MultiSelectField
            label="Productos"
            items={products}
            selectedIds={form.productIds || []}
            onChange={(ids) => handleChange("productIds", ids)}
            placeholder="Selecciona productos"
          />
          <MultiSelectField
            label="Variantes (opcional)"
            items={variants}
            selectedIds={form.variantIds || []}
            onChange={(ids) => handleChange("variantIds", ids)}
            getLabel={variantLabel}
            placeholder="Todas las variantes de los productos elegidos"
          />
        </div>
      )}

      {scope === "CATEGORIES" && (
        <MultiSelectField
          label="Categorías"
          items={categories}
          selectedIds={form.categoryIds || []}
          onChange={(ids) => handleChange("categoryIds", ids)}
          placeholder="Selecciona categorías"
        />
      )}

      {scope === "BRANDS" && (
        <MultiSelectField
          label="Marcas"
          items={brands}
          selectedIds={form.brandIds || []}
          onChange={(ids) => handleChange("brandIds", ids)}
          placeholder="Selecciona marcas"
        />
      )}
    </div>
  );
}
