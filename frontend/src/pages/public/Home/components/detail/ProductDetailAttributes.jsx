import { useMemo } from "react";

function getVariantAttrs(variant) {
  const attrs = {};
  variant?.attributes?.forEach((a) => {
    const name  = a.attributeValue?.attribute?.name;
    const value = a.attributeValue?.value;
    if (name && value) attrs[name] = value;
  });
  return attrs;
}

// Comprueba si cambiar UN atributo sigue llevando a una variante válida.
// checkAttrs: solo lo que el usuario eligió explícitamente (puede ser null → usa variante actual)
// Así, si el usuario solo eligió Talla y no Color, no incluimos Color en el test
// y la disponibilidad de otras Tallas se calcula correctamente.
function isValueAvailable(variants, checkAttrs, attrName, value) {
  const testAttrs = { ...checkAttrs, [attrName]: value };
  return variants.some((v) => {
    const vAttrs = getVariantAttrs(v);
    return Object.entries(testAttrs).every(([n, val]) => vAttrs[n] === val);
  });
}

// attributeOptions: { "Color": ["Negro","Blanco"], "Talla": ["38","39"] } — pre-computado en backend
// selectedVariant:  variante actualmente mostrada (para resaltar los valores)
// selectedAttrs:    elecciones explícitas del usuario (puede ser null al inicio)
// onSelectAttr:     callback al hacer clic en un valor
export default function ProductDetailAttributes({
  attributeOptions = {},
  variants = [],
  selectedVariant,
  selectedAttrs: userSelectedAttrs,
  onSelectAttr,
}) {
  // Para resaltar: qué valores tiene la variante mostrada actualmente
  const displayAttrs = useMemo(() => getVariantAttrs(selectedVariant), [selectedVariant]);

  // Para disponibilidad: solo la selección explícita del usuario.
  // Si nunca interactuó, usa los attrs de la variante por defecto.
  const checkAttrs = useMemo(
    () => userSelectedAttrs ?? getVariantAttrs(selectedVariant),
    [userSelectedAttrs, selectedVariant]
  );

  const attrNames = Object.keys(attributeOptions);
  if (!attrNames.length) return null;

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-5">
      {attrNames.map((name) => {
        const values   = attributeOptions[name];
        const selected = displayAttrs[name];

        return (
          <div key={name}>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-2.5">
              {name}
              {selected && (
                <span className="ml-2 normal-case font-semibold text-gray-600 tracking-normal">
                  {selected}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const isSelected  = displayAttrs[name] === value;
                const isAvailable = isValueAvailable(variants, checkAttrs, name, value);

                return (
                  <button
                    key={value}
                    onClick={() => isAvailable && onSelectAttr?.(name, value)}
                    disabled={!isAvailable}
                    className={`text-sm font-semibold px-4 py-1.5 rounded-full border transition-all ${
                      isSelected
                        ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                        : isAvailable
                        ? "bg-gray-100 text-gray-700 border-gray-200 hover:border-rose-300 hover:bg-rose-50"
                        : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
