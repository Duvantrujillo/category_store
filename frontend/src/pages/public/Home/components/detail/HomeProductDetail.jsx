import { ShoppingBag, X, PackageX, Tag, Barcode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import HomeProductDetailGallery from "./HomeProductDetailGallery";
import noPhotos from "@/assets/icons/no-fotos.png";

function groupAttributes(attributes = []) {
  const map = {};
  attributes.forEach((a) => {
    const name = a.attributeValue?.attribute?.name ?? "Otro";
    if (!map[name]) map[name] = [];
    map[name].push(a.attributeValue?.value ?? "—");
  });
  return map;
}

export default function HomeProductDetail({ variant, onClose, onAddToCart, cartQty = 0 }) {
  if (!variant) return null;

  const { product, price, stock, attributes, images, sku, barcode } = variant;
  const outOfStock = !stock || Number(stock) === 0;
  const atLimit    = !outOfStock && cartQty >= Number(stock);
  const attrGroups   = groupAttributes(attributes);
  const brandLogoSrc = product?.brand?.logoUrl
    ? `${import.meta.env.VITE_API_URL}${product.brand.logoUrl}`
    : null;

  return (
    <Dialog open={!!variant} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="
          w-[calc(100%-1rem)] max-w-5xl p-0 gap-0
          rounded-3xl border border-rose-100 bg-white
          overflow-hidden
        "
      >
        {/* ── Layout: columna en móvil, dos columnas en PC ── */}
        <div className="flex flex-col sm:grid sm:grid-cols-[45%_55%] h-[92dvh] sm:h-[85vh]">

          {/* ── Galería ── */}
          <div className="flex flex-col p-4 sm:p-6 bg-rose-50/40 overflow-y-auto sm:h-full">
            <HomeProductDetailGallery images={images} />
          </div>

          {/* ── Información ── */}
          <div className="flex flex-col gap-4 px-6 py-5 overflow-y-auto sm:h-full">

            {/* Marca */}
            {product?.brand && (
              <div className="flex items-center gap-2">
                {brandLogoSrc && (
                  <img
                    src={brandLogoSrc}
                    alt={product.brand.name}
                    className="w-7 h-7 rounded-lg object-contain border border-rose-100"
                    onError={(e) => { e.currentTarget.src = noPhotos; }}
                  />
                )}
                <span className="text-[11px] font-bold uppercase tracking-widest text-pink-400">
                  {product.brand.name}
                </span>
              </div>
            )}

            {/* Categoría */}
            {product?.category?.name && (
              <span className="self-start flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-500 border border-rose-100">
                <Tag size={10} />
                {product.category.name}
              </span>
            )}

            {/* Nombre */}
            <DialogTitle className="text-2xl font-bold text-rose-900 leading-snug">
              {product?.name}
            </DialogTitle>

            {/* Descripción corta */}
            {product?.shortDescription && (
              <p className="text-sm text-rose-700/65 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Atributos agrupados */}
            {Object.keys(attrGroups).length > 0 && (
              <div className="flex flex-col gap-3 py-1">
                {Object.entries(attrGroups).map(([name, values]) => (
                  <div key={name}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-1.5">
                      {name}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {values.map((v) => (
                        <span
                          key={v}
                          className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="h-px bg-rose-100/60 my-1" />

            {/* Precio */}
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-widest mb-1">
                  Precio
                </p>
                <p className="text-4xl font-bold text-rose-700 leading-none tracking-tight">
                  ${Number(price).toLocaleString("es-CO")}
                </p>
              </div>

              {/* Stock */}
              <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full shrink-0 ${
                outOfStock
                  ? "bg-rose-50 text-rose-400 border border-rose-100"
                  : "bg-green-50 text-green-600 border border-green-100"
              }`}>
                {outOfStock
                  ? <><PackageX size={13} />Sin stock</>
                  : <><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />{stock} disponibles</>
                }
              </div>
            </div>

            {/* Botón carrito */}
            <button
              onClick={() => { if (!outOfStock && !atLimit) { onAddToCart(variant); onClose(); } }}
              disabled={outOfStock || atLimit}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-full bg-rose-400 hover:bg-rose-500 active:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold tracking-wide transition-colors shadow-md shadow-rose-200/50"
            >
              <ShoppingBag size={17} />
              {outOfStock ? "No disponible" : atLimit ? "Límite de stock" : "Agregar al carrito"}
            </button>

            {/* Descripción completa */}
            {product?.description && (
              <details className="group">
                <summary className="cursor-pointer list-none flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-rose-400 select-none">
                  <span className="group-open:rotate-90 transition-transform inline-block leading-none">▶</span>
                  Descripción completa
                </summary>
                <p className="mt-2.5 text-xs text-rose-700/60 leading-relaxed border-l-2 border-rose-100 pl-3">
                  {product.description}
                </p>
              </details>
            )}

            {/* SKU / Código */}
            {(sku || barcode) && (
              <div className="flex flex-col gap-1 pt-1 mt-auto border-t border-rose-50">
                {sku && (
                  <p className="flex items-center gap-1.5 text-[10px] text-rose-300">
                    <Tag size={10} />SKU: <span className="font-mono">{sku}</span>
                  </p>
                )}
                {barcode && (
                  <p className="flex items-center gap-1.5 text-[10px] text-rose-300">
                    <Barcode size={10} />Cód: <span className="font-mono">{barcode}</span>
                  </p>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-rose-400 hover:bg-rose-50 hover:text-rose-600 border border-rose-100 shadow-sm transition-colors"
        >
          <X size={15} />
        </button>

      </DialogContent>
    </Dialog>
  );
}
