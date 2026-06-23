import { useState } from "react";
import noPhotos from "@/assets/icons/no-fotos.png";

function url(imageUrl) {
  return imageUrl ? `${import.meta.env.VITE_API_URL}${imageUrl}` : null;
}

export default function HomeProductDetailGallery({ images = [] }) {
  const sorted  = [...images].sort((a, b) => Number(a.slot) - Number(b.slot));
  const all     = sorted.length ? sorted : [];
  const initial = all[0]?.imageUrl ?? null;

  const [active, setActive] = useState(initial);
  const activeSrc = url(active) ?? noPhotos;

  return (
    <div className="flex flex-col sm:flex-row gap-3 h-full">

      {/* Miniaturas: fila horizontal en móvil, columna vertical en PC */}
      {all.length > 1 && (
        <div className="order-2 sm:order-1 flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden sm:w-[72px] pb-1 sm:pb-0 sm:pr-1">
          {all.map((img) => {
            const src   = url(img.imageUrl) ?? noPhotos;
            const isAct = active === img.imageUrl;
            return (
              <button
                key={img.slot}
                onClick={() => setActive(img.imageUrl)}
                className={`shrink-0 w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  isAct
                    ? "border-rose-400 shadow-md shadow-rose-200/60 scale-105"
                    : "border-rose-100 hover:border-rose-300 opacity-70 hover:opacity-100"
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}

      {/* Imagen principal */}
      <div className="order-1 sm:order-2 flex-1 relative rounded-2xl overflow-hidden bg-rose-50/60 border border-rose-100 min-h-[260px] sm:min-h-0">
        <img
          key={active}
          src={activeSrc}
          alt="Producto"
          className="w-full h-full object-cover animate-[fadeSlideUp_0.3s_ease_forwards]"
        />
      </div>

    </div>
  );
}
