import noPhotos from "@/assets/icons/no-fotos.png";

export default function HomeCategoryCard({ category, selected, onClick }) {
  const imgSrc = category.imageUrl
    ? `${import.meta.env.VITE_API_URL}${category.imageUrl}`
    : noPhotos;

  return (
    <button
      onClick={onClick}
      className="group shrink-0 focus:outline-none w-48"
    >
      <div
        className={`relative w-48 h-64 rounded-2xl overflow-hidden transition-all duration-300
          ${selected
            ? "ring-2 ring-rose-400 ring-offset-2 shadow-lg shadow-rose-200/60"
            : "shadow-sm hover:shadow-lg hover:shadow-rose-200/50"
          }`}
      >
        {/* Imagen */}
        <img
          src={imgSrc}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Degradado inferior para legibilidad del texto */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

        {/* Punto activo */}
        {selected && (
          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-300 shadow-sm" />
        )}

        {/* Nombre dentro de la imagen */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3.5 flex flex-col items-center">
          <span
            className="text-white text-sm font-semibold text-center leading-tight line-clamp-2 tracking-wide drop-shadow-sm"
            style={{ fontFamily: "system-ui, 'Segoe UI', sans-serif" }}
          >
            {category.name}
          </span>
          {/* Línea subrayado que aparece al hacer hover */}
          <span
            className="block h-[1.5px] bg-white mt-1.5 rounded-full transition-all duration-300 origin-center
              w-0 group-hover:w-full opacity-0 group-hover:opacity-100"
          />
        </div>
      </div>
    </button>
  );
}
