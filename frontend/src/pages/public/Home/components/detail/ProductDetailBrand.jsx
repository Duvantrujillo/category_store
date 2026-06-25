import noPhotos from "@/assets/icons/no-fotos.png";

const API = import.meta.env.VITE_API_URL;

export default function ProductDetailBrand({ brand }) {
  if (!brand) return null;
  const logoSrc = brand.logoUrl ? `${API}${brand.logoUrl}` : null;

  return (
    <div className="flex items-center gap-2">
      {logoSrc && (
        <img
          src={logoSrc}
          alt={brand.name}
          className="w-7 h-7 rounded-md object-contain border border-gray-100"
          onError={(e) => { e.currentTarget.src = noPhotos; }}
        />
      )}
      <span className="text-[11px] font-black uppercase tracking-[0.22em] text-rose-500">
        {brand.name}
      </span>
    </div>
  );
}
