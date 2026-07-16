import { useState, useEffect } from "react";
import noPhotos from "@/assets/icons/no-fotos.png";

const API = import.meta.env.VITE_API_URL;
function url(path) { return path ? `${API}${path}` : null; }

// images: todas las imágenes de todas las variantes, cada una con variantId
// selectedVariantId: la variante actualmente seleccionada
// productMainImage: imagen principal del producto — se usa cuando la
// variante seleccionada no tiene imágenes propias, antes de caer a
// cualquier otra imagen del pool o al ícono de "sin foto".
export default function ProductDetailGallery({ images = [], selectedVariantId, productMainImage = null, outOfStock = false, discountPercent = 0 }) {
  const [active, setActive] = useState(null);

  // Cuando cambia la variante seleccionada: su propia imagen primero, si no
  // tiene ninguna cae a la imagen del producto, y si tampoco hay, se
  // mantiene el comportamiento anterior (primera imagen del pool).
  useEffect(() => {
    const variantImg = images.find((img) => img.productVariantId === selectedVariantId);
    if (variantImg) { setActive(variantImg.imageUrl); return; }
    if (productMainImage) { setActive(productMainImage); return; }
    const first = images[0] ?? null;
    if (first) setActive(first.imageUrl);
  }, [selectedVariantId, images, productMainImage]);

  const activeSrc = (active ? url(active) : null) ?? noPhotos;

  return (
    <div className="flex flex-col sm:flex-row gap-3 h-full">

      {images.length > 1 && (
        <div className="order-2 sm:order-1 flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden sm:w-[80px] pb-1 sm:pb-0 sm:pr-1">
          {images.map((img, idx) => {
            const src       = url(img.imageUrl) ?? noPhotos;
            const isAct     = active === img.imageUrl;
            const isVariant = img.productVariantId === selectedVariantId;

            return (
              <button
                key={`${img.productVariantId}-${img.slot ?? idx}`}
                onClick={() => setActive(img.imageUrl)}
                className={`shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  isAct
                    ? "border-rose-500 shadow-md opacity-100"
                    : isVariant
                    ? "border-gray-300 opacity-100 hover:border-rose-300"
                    : "border-gray-100 opacity-35 hover:opacity-65 hover:border-gray-300"
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}

      <div className="order-1 sm:order-2 flex-1 relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm min-h-[300px] sm:min-h-0">
        <img
          key={active}
          src={activeSrc}
          alt="Producto"
          className={`w-full h-full object-contain transition-all ${outOfStock ? "opacity-60 grayscale-30" : ""}`}
        />
        {outOfStock && (
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-700/80 text-white tracking-wide uppercase">
            Agotado
          </span>
        )}
        {discountPercent > 0 && (
          <span className="absolute top-4 right-4 text-lg font-black px-4 py-2 rounded-xl bg-linear-to-br from-rose-500 to-pink-600 text-white shadow-lg ring-2 ring-white/70 tracking-wide">
            -{discountPercent}%
          </span>
        )}
      </div>

    </div>
  );
}
