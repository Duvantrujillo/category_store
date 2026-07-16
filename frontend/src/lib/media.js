// Imagen a mostrar para una variante: primero su propia imagen (slot 1, o la
// primera si no hay slot 1), y si la variante no tiene ninguna, la imagen
// principal del producto (product.mainImage) — nunca al revés, la variante
// siempre manda si tiene algo propio. Devuelve null si tampoco hay imagen de
// producto, para que el caller decida su propio fallback (ícono, no-fotos.png).
export function getVariantImage(variant) {
  if (!variant) return null;
  const images = variant.images;
  if (images?.length) {
    const main = images.find((img) => Number(img.slot) === 1);
    return main?.imageUrl ?? images[0]?.imageUrl ?? null;
  }
  return variant.product?.mainImage ?? null;
}
