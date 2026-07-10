import { getAvailableUnits } from "@/lib/stock";

const API = import.meta.env.VITE_API_URL;
function url(path) { return path ? `${API}${path}` : null; }

function variantLabel(variant) {
  if (!variant) return "";
  const attrs = (variant.attributes ?? [])
    .map((a) => a.attributeValue?.value)
    .filter(Boolean)
    .join(" · ");
  return attrs || variant.sku || "";
}

// Solo la imagen principal del producto — si no tiene ninguna, no se muestra nada.
function VariantThumbs({ variant }) {
  const images = (variant?.images ?? []).slice(0, 1);
  if (images.length === 0) return null;

  return (
    <div className="flex gap-1.5 shrink-0">
      {images.map((img, i) => (
        <div key={i} className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
          <img src={url(img.imageUrl)} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

// Un componente del combo: fijo (una variante puntual, ya decidida por el
// admin) o libre (el cliente elige entre las variantes del producto al
// agregar el combo al carrito — acá solo se previsualizan las opciones).
export default function BundleDetailItem({ item }) {
  const isFree = !item.productVariantId;
  const representativeVariant = isFree
    ? (item.product.variants.find((v) => getAvailableUnits(v) >= item.quantity) ?? item.product.variants[0])
    : item.productVariant;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-3 shadow-sm">
      <VariantThumbs variant={representativeVariant} />

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">
          {item.product.name} <span className="text-gray-400 font-normal">× {item.quantity}</span>
        </p>

        {isFree ? (
          <p className="text-[11px] text-rose-400 font-medium mt-0.5">Eliges la opción al agregar al carrito</p>
        ) : (
          <p className="text-[11px] text-gray-400 mt-0.5">{variantLabel(representativeVariant)}</p>
        )}
      </div>
    </div>
  );
}
