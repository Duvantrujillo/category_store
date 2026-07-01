import { useState, useEffect } from "react";
import noPhotos from "@/assets/icons/no-fotos.png";

const API = import.meta.env.VITE_API_URL;
function url(path) { return path ? `${API}${path}` : null; }

// images: todas las imágenes de todas las variantes, cada una con variantId
// selectedVariantId: la variante actualmente seleccionada
export default function ProductDetailGallery({ images = [], selectedVariantId }) {
  const [active, setActive] = useState(null);

  // Cuando cambia la variante seleccionada, saltar a su primera imagen
  useEffect(() => {
    const first = images.find((img) => img.productVariantId === selectedVariantId) ?? images[0] ?? null;
    if (first) setActive(first.imageUrl);
  }, [selectedVariantId, images]);

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
          className="w-full h-full object-contain"
        />
      </div>

    </div>
  );
}
