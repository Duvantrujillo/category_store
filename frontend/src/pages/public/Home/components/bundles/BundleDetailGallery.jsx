import { useState, useEffect } from "react";
import noPhotos from "@/assets/icons/no-fotos.png";

const API = import.meta.env.VITE_API_URL;
function url(path) { return path ? `${API}${path}` : null; }

// images: [{ imageUrl }] — la imagen principal del combo + principal/secundaria
// de cada producto que incluye. Mismo patrón visual que ProductDetailGallery.
export default function BundleDetailGallery({ images = [] }) {
  const [active, setActive] = useState(images[0]?.imageUrl ?? null);

  useEffect(() => {
    setActive(images[0]?.imageUrl ?? null);
  }, [images]);

  const activeSrc = (active ? url(active) : null) ?? noPhotos;

  return (
    <div className="flex flex-col sm:flex-row gap-3 h-full">

      {images.length > 1 && (
        <div className="order-2 sm:order-1 flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden sm:w-[80px] pb-1 sm:pb-0 sm:pr-1">
          {images.map((img, idx) => {
            const src   = url(img.imageUrl) ?? noPhotos;
            const isAct = active === img.imageUrl;

            return (
              <button
                key={`${img.imageUrl}-${idx}`}
                onClick={() => setActive(img.imageUrl)}
                className={`shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  isAct
                    ? "border-rose-500 shadow-md opacity-100"
                    : "border-gray-100 opacity-60 hover:opacity-100 hover:border-gray-300"
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
          alt="Combo"
          className="w-full h-full object-contain"
        />
      </div>

    </div>
  );
}
