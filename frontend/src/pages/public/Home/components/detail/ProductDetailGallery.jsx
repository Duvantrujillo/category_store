import { useState } from "react";
import noPhotos from "@/assets/icons/no-fotos.png";

const API = import.meta.env.VITE_API_URL;
function url(path) { return path ? `${API}${path}` : null; }

export default function ProductDetailGallery({ images = [] }) {
  const sorted   = [...images].sort((a, b) => Number(a.slot) - Number(b.slot));
  const initial  = sorted[0]?.imageUrl ?? null;
  const [active, setActive] = useState(initial);
  const activeSrc = url(active) ?? noPhotos;

  return (
    <div className="flex flex-col sm:flex-row gap-3 h-full">
      {sorted.length > 1 && (
        <div className="order-2 sm:order-1 flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden sm:w-[80px] pb-1 sm:pb-0 sm:pr-1">
          {sorted.map((img) => {
            const src   = url(img.imageUrl) ?? noPhotos;
            const isAct = active === img.imageUrl;
            return (
              <button
                key={img.slot}
                onClick={() => setActive(img.imageUrl)}
                className={`shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  isAct
                    ? "border-rose-500 shadow-md"
                    : "border-gray-200 hover:border-rose-300 opacity-55 hover:opacity-100"
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
