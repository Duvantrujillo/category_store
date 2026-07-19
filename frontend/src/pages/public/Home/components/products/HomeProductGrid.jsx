import { Loader2 } from "lucide-react";
import HomeProductRow from "./HomeProductRow";
import HomeProductSkeleton from "./HomeProductSkeleton";
import HomeProductEmpty from "./HomeProductEmpty";

const PAGE_SIZE = 8;
const SKELETON_ROWS = 2;
const SKELETON_CARDS_PER_ROW = 4;
const SKELETON_CARD_CLS = "shrink-0 w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)]";

export default function HomeProductGrid({
  variants,
  loading,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  search,
  selectedCategory,
  selectedParent,
  onAddToCart,
  onToggleFavorite,
  favoritedIds,
  cartQtyById,
  topSellerIds,
}) {
  // Bloques de hasta 8 productos; cada uno se muestra como un carrusel
  // horizontal (4 visibles en pantalla + flechas para navegar el resto).
  const groups = [];
  for (let i = 0; i < variants.length; i += PAGE_SIZE) {
    groups.push(variants.slice(i, i + PAGE_SIZE));
  }

  // En la vista por defecto (sin búsqueda ni categoría), si un bloque queda
  // "huérfano" (menos productos que PAGE_SIZE), se rellena repitiendo
  // productos ya existentes del catálogo para que la fila no quede en blanco.
  // A medida que se agreguen productos reales, ocuparán esos cupos y los
  // repetidos van desapareciendo solos. Pero si el catálogo activo tiene muy
  // pocos productos en total, rellenar se ve como si el mismo producto se
  // hubiera duplicado varias veces — mejor mostrar el bloque corto tal cual
  // que forzar una repetición evidente. Tampoco se rellena el último bloque
  // mientras todavía hay más páginas por cargar (hasMore): ese bloque corto
  // no es realmente el final del catálogo, solo el borde de lo ya traído —
  // se completa solo cuando el usuario pide "Ver más".
  const MIN_TO_PAD = Math.ceil(PAGE_SIZE / 2);
  const isDefaultView = !search && !selectedCategory && !selectedParent;
  const lastGroupIdx = groups.length - 1;
  const displayGroups = isDefaultView
    ? groups.map((group, idx) => {
        const isTrailingIncompletePage = idx === lastGroupIdx && hasMore;
        if (group.length === 0 || group.length >= PAGE_SIZE || variants.length < MIN_TO_PAD || isTrailingIncompletePage) return group;
        const padded = [...group];
        let i = 0;
        while (padded.length < PAGE_SIZE) {
          padded.push(variants[i % variants.length]);
          i++;
        }
        return padded;
      })
    : groups;

  return (
    <section className="mt-2">

      {/* ── Encabezado ── */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-5 px-4 sm:px-0">
        <h2
          className="text-3xl sm:text-5xl lg:text-7xl font-black"
          style={{ color: "#4b5563", WebkitTextStroke: "1.5px #4b5563", letterSpacing: "0.1em" }}
        >
          {search
            ? `Resultados para "${search}"`
            : selectedCategory || selectedParent
            ? "Productos de esta categoría"
            : "Nuestros productos"}
        </h2>
        {!loading && variants.length > 0 && (
          <span className="text-xs text-gray-400 font-medium tabular-nums">
            <span className="sm:hidden">{variants.length} prod.</span>
            <span className="hidden sm:inline">{variants.length} {variants.length === 1 ? "producto" : "productos"}</span>
          </span>
        )}
      </div>

      {/* ── Skeleton: mismo layout de fila/carrusel que el contenido real ── */}
      {loading && (
        <div className="flex flex-col gap-6">
          {Array.from({ length: SKELETON_ROWS }).map((_, row) => (
            <div key={row} className="flex gap-3 sm:gap-4 overflow-hidden px-4 sm:px-0">
              {Array.from({ length: SKELETON_CARDS_PER_ROW }).map((_, i) => (
                <div key={i} className={SKELETON_CARD_CLS}>
                  <HomeProductSkeleton />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Sin resultados ── */}
      {!loading && variants.length === 0 && (
        <HomeProductEmpty search={search} />
      )}

      {/* ── Cada bloque de hasta 12: carrusel horizontal (4 visibles + flechas) ── */}
      {!loading && variants.length > 0 && displayGroups.map((group, idx) => (
        <HomeProductRow
          key={idx}
          variants={group}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
          favoritedIds={favoritedIds}
          cartQtyById={cartQtyById}
          topSellerIds={topSellerIds}
        />
      ))}

      {/* ── Ver más — pide la siguiente página al backend (12 filas ya
          cargadas, 96 productos), nunca se calcula del lado del cliente ── */}
      {!loading && hasMore && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 h-11 px-8 rounded-full border border-rose-200 text-rose-500 text-xs font-bold uppercase tracking-widest hover:bg-rose-50 active:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? <><Loader2 size={15} className="animate-spin" /> Cargando…</> : "Ver más"}
          </button>
        </div>
      )}

    </section>
  );
}
