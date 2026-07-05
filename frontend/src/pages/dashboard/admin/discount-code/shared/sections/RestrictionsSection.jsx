import MultiSelectField from "../MultiSelectField";

export default function RestrictionsSection({ form, handleChange, products = [], categories = [], brands = [] }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Restricciones</h3>
        <p className="text-xs text-muted-foreground">
          Si eliges <strong>productos</strong> puntuales (sin categoría ni marca), el cupón se puede mezclar con
          cualquier otra cosa en el carrito y el descuento solo aplica a esos productos. Si en cambio eliges
          <strong> categoría</strong> y/o <strong>marca</strong>, el cupón solo será válido cuando toda la compra
          pertenezca a esa selección (si el carrito mezcla algo fuera de ella, se rechaza) y el descuento aplica
          sobre el total de la orden. Si no seleccionas nada, aplica a cualquier compra.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MultiSelectField
          label="Productos"
          items={products}
          selectedIds={form.productIds || []}
          onChange={(ids) => handleChange("productIds", ids)}
        />

        <MultiSelectField
          label="Categorías"
          items={categories}
          selectedIds={form.categoryIds || []}
          onChange={(ids) => handleChange("categoryIds", ids)}
        />

        <MultiSelectField
          label="Marcas"
          items={brands}
          selectedIds={form.brandIds || []}
          onChange={(ids) => handleChange("brandIds", ids)}
        />
      </div>
    </div>
  );
}
