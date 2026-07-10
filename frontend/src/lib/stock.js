// Unidades realmente disponibles de una variante = stock físico menos lo que
// ya está reservado por pedidos PENDING (incluidos los que alguien empezó y
// nunca terminó de pagar). Usar siempre esto en vez de `variant.stock` a
// secas para decidir si algo está "Agotado" — si no, un pedido abandonado
// deja esa unidad viéndose disponible (o peor, marcando "Límite de stock" en
// vez de "Agotado") hasta que expire a los 30 min y se libere la reserva.
export function getAvailableUnits(variant) {
  if (!variant) return 0;
  const stock = Number(variant.stock ?? 0);
  const reserved = Number(variant.reservedStock ?? 0);
  return Math.max(0, stock - reserved);
}
