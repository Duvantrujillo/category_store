const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Regalos ACTIVE, vigentes hoy y que aún no agotaron su usageLimit —
// ordenados por minimumPurchase asc para que resolveGiftForSubtotal pueda
// recorrerlos en orden.
async function getActiveGiftRules(db = prisma) {
  const now = new Date();

  const gifts = await db.purchaseGift.findMany({
    where: {
      status: "ACTIVE",
      startsAt: { lte: now },
      expiresAt: { gte: now },
      // Si el admin desactivó la variante regalada (agotado permanente,
      // producto discontinuado, etc.) el regalo deja de estar disponible
      // aunque el registro de PurchaseGift siga en ACTIVE — mismo criterio
      // que usa createOrder para los ítems normales del carrito.
      productVariant: { isActive: true },
    },
    include: {
      _count: { select: { usages: true } },
      productVariant: {
        select: {
          id: true,
          sku: true,
          price: true,
          stock: true,
          reservedStock: true,
          isActive: true,
          product: { select: { id: true, name: true, mainImage: true } },
          images: { select: { imageUrl: true, slot: true }, orderBy: { slot: "asc" }, take: 1 },
        },
      },
    },
    // `id asc` como desempate estable: si dos regalos comparten exactamente
    // el mismo minimumPurchase, sin esto MySQL no garantiza un orden
    // consistente entre consultas, y el regalo mostrado en el preview del
    // carrito podría no coincidir con el que realmente se entrega al pagar.
    orderBy: [{ minimumPurchase: "asc" }, { id: "asc" }],
  });

  return gifts
    .filter((g) => g.usageLimit == null || g._count.usages < g.usageLimit)
    // Sin stock disponible: se excluye de entrada en vez de dejar que el
    // cliente vea "¡lo calificaste!" en el carrito y que luego, al crear la
    // orden, la reserva atómica lo descarte en silencio. Como efecto
    // adicional, si el escalón más alto que alguien alcanza está agotado,
    // esto permite que aplique el siguiente escalón inferior que sí tenga
    // stock, en vez de quedarse sin ningún regalo.
    .filter((g) => (g.productVariant.stock - g.productVariant.reservedStock) >= g.quantity);
}

// Dado un subtotal y las reglas activas (ya ordenadas asc por
// minimumPurchase), decide cuál regalo califica ahora mismo (el de mayor
// umbral que el subtotal ya alcanza) y cuál es el siguiente escalón por
// desbloquear. Pura (sin DB) para reutilizarla igual en el carrito y en la
// creación de la orden.
function resolveGiftForSubtotal(subtotal, activeGifts) {
  let qualified = null;
  let next = null;

  for (const gift of activeGifts) {
    if (Number(gift.minimumPurchase) <= subtotal) {
      // Empate en minimumPurchase: gana el id más bajo (el regalo creado
      // primero), para que el resultado sea siempre el mismo sin importar
      // el orden en que haya llegado la fila desde la base de datos.
      const better =
        !qualified
        || Number(gift.minimumPurchase) > Number(qualified.minimumPurchase)
        || (Number(gift.minimumPurchase) === Number(qualified.minimumPurchase) && gift.id < qualified.id);
      if (better) qualified = gift;
    } else if (
      !next
      || Number(gift.minimumPurchase) < Number(next.minimumPurchase)
      || (Number(gift.minimumPurchase) === Number(next.minimumPurchase) && gift.id < next.id)
    ) {
      next = gift;
    }
  }

  return { qualified, next };
}

module.exports = { getActiveGiftRules, resolveGiftForSubtotal };
