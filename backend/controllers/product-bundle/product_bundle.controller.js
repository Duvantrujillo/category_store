const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const slugify = require('slugify')
const fs = require("fs");
const path = require("path");

const MAX_ITEMS_PER_BUNDLE = 20

const deleteUploadedFile = (file, folder = 'product-bundle') => {
    if (!file) return;
    const filePath = path.join(__dirname, `../../uploads/${folder}`, file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// Campos de variante reutilizados tanto para la variante "fija" (productVariant)
// como para las variantes disponibles de un componente "libre" (product.variants),
// necesarios para que el cliente pueda elegir en la tienda pública.
const VARIANT_SELECT = {
    id: true,
    sku: true,
    price: true,
    stock: true,
    reservedStock: true,
    isActive: true,
    images: { select: { imageUrl: true, slot: true }, orderBy: { slot: 'asc' }, take: 2 },
    attributes: {
        select: {
            attributeValue: {
                select: { value: true, attribute: { select: { name: true } } }
            }
        }
    },
}

// Include reutilizado en las lecturas admin y públicas del combo.
const BUNDLE_INCLUDE = {
    items: {
        select: {
            id: true,
            quantity: true,
            productId: true,
            productVariantId: true,
            product: {
                select: {
                    id: true, name: true, slug: true, mainImage: true,
                    // Solo se usan cuando productVariantId es null (componente "libre"),
                    // para que el cliente elija entre estas en la tienda.
                    variants: { where: { isActive: true }, select: VARIANT_SELECT },
                }
            },
            // Solo tiene valor cuando el admin fijó una variante puntual.
            productVariant: { select: VARIANT_SELECT },
        }
    }
}

// Normaliza y valida el array de componentes del combo (items).
// Acepta tanto un array ya parseado como un JSON string (llega como string
// cuando el request es multipart/form-data por la subida de mainImage).
// Cada item: { productId, productVariantId: number|null, quantity }
// productVariantId null/omitido = "libre" (el cliente elige la variante al
// agregar el combo al carrito). Con valor = "fija" (esa variante exacta).
function parseItems(raw) {
    let value = raw
    if (typeof value === 'string') {
        try { value = JSON.parse(value) } catch { return { error: 'Formato de productos del combo inválido' } }
    }
    if (!Array.isArray(value) || value.length === 0) {
        return { error: 'El combo debe tener al menos un producto' }
    }
    if (value.length > MAX_ITEMS_PER_BUNDLE) {
        return { error: `Máximo ${MAX_ITEMS_PER_BUNDLE} productos distintos por combo` }
    }

    const seen = new Set()
    const items = []
    for (const raw of value) {
        const productId = parseInt(raw?.productId, 10)
        const quantity = parseInt(raw?.quantity, 10)

        let productVariantId = null
        if (raw?.productVariantId !== null && raw?.productVariantId !== undefined && raw?.productVariantId !== '') {
            productVariantId = parseInt(raw.productVariantId, 10)
            if (!Number.isInteger(productVariantId) || productVariantId <= 0) {
                return { error: 'La variante fija seleccionada es inválida' }
            }
        }

        if (!Number.isInteger(productId) || productId <= 0) {
            return { error: 'Uno de los productos del combo es inválido' }
        }
        if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 9999) {
            return { error: `Cantidad inválida para el producto ${productId} (1-9999)` }
        }
        if (seen.has(productId)) {
            return { error: `Producto duplicado en el combo: ${productId}` }
        }
        seen.add(productId)
        items.push({ productId, productVariantId, quantity })
    }

    return { items }
}

// Valida que los productos existan y que, si se fijó una variante puntual,
// esa variante exista y pertenezca al producto indicado (evita que se guarde
// una variante de un producto distinto por manipulación del request).
async function validateItemsExist(items) {
    const productIds = items.map((i) => i.productId)
    const productCount = await prisma.product.count({ where: { id: { in: productIds } } })
    if (productCount !== productIds.length) return 'Uno o más productos seleccionados no existen'

    const fixedItems = items.filter((i) => i.productVariantId !== null)
    if (fixedItems.length) {
        const variantIds = fixedItems.map((i) => i.productVariantId)
        const variants = await prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            select: { id: true, productId: true }
        })
        const variantMap = Object.fromEntries(variants.map((v) => [v.id, v]))
        for (const item of fixedItems) {
            const variant = variantMap[item.productVariantId]
            if (!variant) return `La variante fija seleccionada para uno de los productos no existe`
            if (variant.productId !== item.productId) return `La variante fija seleccionada no pertenece al producto indicado`
        }
    }

    return null
}

// Si se quiere dejar el combo activo, exige que cada producto tenga stock
// disponible: la variante fija (si la hay) con stock > 0, o al menos una
// variante activa del producto con stock > 0 si el componente es "libre".
// Devuelve el nombre del primer producto agotado, o null si todo está bien.
async function findOutOfStockProduct(items) {
    const productIds = items.map((i) => i.productId)
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
            id: true, name: true,
            variants: { where: { isActive: true }, select: { id: true, stock: true } }
        }
    })
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

    for (const item of items) {
        const product = productMap[item.productId]
        if (!product) continue // ya se validó existencia en validateItemsExist

        if (item.productVariantId) {
            const variant = product.variants.find((v) => v.id === item.productVariantId)
            if (!variant || Number(variant.stock) <= 0) return product.name
        } else if (!product.variants.some((v) => Number(v.stock) > 0)) {
            return product.name
        }
    }

    return null
}

// Misma comprobación que findOutOfStockProduct, pero sobre un combo ya
// cargado con BUNDLE_INCLUDE (evita una segunda consulta a la BD).
function findOutOfStockProductInLoadedBundle(bundle) {
    for (const item of bundle.items) {
        if (item.productVariantId) {
            if (!item.productVariant || Number(item.productVariant.stock) <= 0) return item.product.name
        } else if (!item.product.variants.some((v) => Number(v.stock) > 0)) {
            return item.product.name
        }
    }
    return null
}

// Auto-desactiva un combo si está marcado activo pero alguno de sus
// productos se quedó sin stock. No hay un job en segundo plano que
// reaccione a cambios de stock en otro lado (ventas, ajustes de inventario,
// etc.), así que esta reconciliación "perezosa" corre cada vez que se lee
// el combo (listados admin/público, detalle) — se autocorrige solo la
// primera vez que alguien lo consulta después de agotarse.
async function reconcileBundleActiveState(bundle) {
    if (!bundle.isActive) return bundle
    const outOfStockProduct = findOutOfStockProductInLoadedBundle(bundle)
    if (!outOfStockProduct) return bundle
    await prisma.productBundle.update({ where: { id: bundle.id }, data: { isActive: false } })
    return { ...bundle, isActive: false }
}

async function reconcileBundlesActiveState(bundles) {
    return Promise.all(bundles.map(reconcileBundleActiveState))
}

// Valida los campos comunes (no incluye items ni imagen).
function validateFields(body) {
    const { name, description, price } = body

    if (!name || !name.trim()) {
        return { error: 'El nombre es obligatorio' }
    }
    if (name.trim().length > 80) {
        return { error: 'El nombre no puede superar 80 caracteres' }
    }
    if (description && description.length > 800) {
        return { error: 'La descripción no puede superar 800 caracteres' }
    }

    const numericPrice = Number(price)
    if (price === undefined || price === null || price === '' || isNaN(numericPrice) || numericPrice <= 0) {
        return { error: 'El precio del combo debe ser un número mayor a 0' }
    }

    return {
        data: {
            name: name.trim(),
            description: description?.trim() || null,
            price: numericPrice,
        }
    }
}

const createProductBundle = async (req, res) => {
    try {
        const file = req.file
        const { isActive } = req.body

        const { error, data } = validateFields(req.body)
        if (error) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: error })
        }

        const { error: itemsError, items } = parseItems(req.body.items)
        if (itemsError) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: itemsError })
        }

        const itemsExistError = await validateItemsExist(items)
        if (itemsExistError) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: itemsExistError })
        }

        const customerSlug = slugify(data.name, { lower: true, strict: true })
        const slugExist = await prisma.productBundle.findUnique({ where: { slug: customerSlug } })
        if (slugExist) {
            deleteUploadedFile(file)
            return res.status(409).json({ message: 'El nombre ya existe' })
        }

        let isActiveValue = isActive
        if (typeof isActiveValue === "string") isActiveValue = isActiveValue === "true"
        if (typeof isActiveValue !== "boolean") isActiveValue = true

        if (isActiveValue) {
            const outOfStockProduct = await findOutOfStockProduct(items)
            if (outOfStockProduct) {
                deleteUploadedFile(file)
                return res.status(400).json({ message: `No puedes activar el combo: "${outOfStockProduct}" está agotado` })
            }
        }

        const mainImage = file ? `/uploads/product-bundle/${file.filename}` : null

        const created = await prisma.$transaction(async (tx) => {
            const bundle = await tx.productBundle.create({
                data: {
                    name: data.name,
                    slug: customerSlug,
                    description: data.description,
                    price: data.price,
                    mainImage,
                    isActive: isActiveValue,
                }
            })

            await tx.productBundleItem.createMany({
                data: items.map((item) => ({
                    bundleId: bundle.id,
                    productId: item.productId,
                    productVariantId: item.productVariantId,
                    quantity: item.quantity,
                }))
            })

            return tx.productBundle.findUnique({ where: { id: bundle.id }, include: BUNDLE_INCLUDE })
        })

        return res.status(201).json({ message: 'Combo creado', data: created })
    } catch (error) {
        deleteUploadedFile(req.file)
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'El nombre ya existe' })
        }
        console.error('Error en createProductBundle:', error)
        return res.status(500).json({ message: 'Error interno' })
    }
}

const updateProductBundle = async (req, res) => {
    try {
        const formId = Number(req.params.id)
        const file = req.file
        const { isActive } = req.body

        if (isNaN(formId)) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: 'ID inválido' })
        }

        const bundleExist = await prisma.productBundle.findUnique({ where: { id: formId } })
        if (!bundleExist) {
            deleteUploadedFile(file)
            return res.status(404).json({ message: 'No encontrado' })
        }

        const { error, data } = validateFields(req.body)
        if (error) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: error })
        }

        const { error: itemsError, items } = parseItems(req.body.items)
        if (itemsError) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: itemsError })
        }

        const itemsExistError = await validateItemsExist(items)
        if (itemsExistError) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: itemsExistError })
        }

        const customerSlug = slugify(data.name, { lower: true, strict: true })
        const slugExist = await prisma.productBundle.findFirst({
            where: { slug: customerSlug, NOT: { id: formId } }
        })
        if (slugExist) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: 'El nombre ya existe' })
        }

        let isActiveValue = isActive
        if (typeof isActiveValue === "string") isActiveValue = isActiveValue === "true"
        if (typeof isActiveValue !== "boolean") isActiveValue = bundleExist.isActive

        if (isActiveValue) {
            const outOfStockProduct = await findOutOfStockProduct(items)
            if (outOfStockProduct) {
                deleteUploadedFile(file)
                return res.status(400).json({ message: `No puedes activar el combo: "${outOfStockProduct}" está agotado` })
            }
        }

        let mainImage = bundleExist.mainImage
        if (file) {
            if (bundleExist.mainImage) {
                const oldImagePath = path.join(__dirname, "../../", bundleExist.mainImage)
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath)
            }
            mainImage = `/uploads/product-bundle/${file.filename}`
        }

        const updated = await prisma.$transaction(async (tx) => {
            const bundle = await tx.productBundle.update({
                where: { id: formId },
                data: {
                    name: data.name,
                    slug: customerSlug,
                    description: data.description,
                    price: data.price,
                    mainImage,
                    isActive: isActiveValue,
                }
            })

            // Reemplaza la selección completa de componentes por la nueva. Los
            // carritos que ya tenían este combo agregado con selecciones sobre
            // un componente que se elimina acá pierden esa selección (onDelete:
            // Cascade en CartBundleItemSelection.productBundleItem) — el
            // carrito sigue existiendo, solo se recalcula al volver a leerlo.
            await tx.productBundleItem.deleteMany({ where: { bundleId: formId } })
            await tx.productBundleItem.createMany({
                data: items.map((item) => ({
                    bundleId: formId,
                    productId: item.productId,
                    productVariantId: item.productVariantId,
                    quantity: item.quantity,
                }))
            })

            return tx.productBundle.findUnique({ where: { id: bundle.id }, include: BUNDLE_INCLUDE })
        })

        return res.status(200).json({ message: 'Combo actualizado', data: updated })
    } catch (error) {
        deleteUploadedFile(req.file)
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'El nombre ya existe' })
        }
        console.error('Error en updateProductBundle:', error)
        return res.status(500).json({ message: 'Error interno' })
    }
}

const deleteProductBundle = async (req, res) => {
    try {
        const formId = Number(req.params.id)
        if (isNaN(formId)) {
            return res.status(400).json({ message: 'ID inválido' })
        }

        const bundleExist = await prisma.productBundle.findUnique({ where: { id: formId } })
        if (!bundleExist) {
            return res.status(404).json({ message: 'No encontrado' })
        }

        // Si el combo ya fue comprado, se conserva el historial de la orden —
        // no se puede eliminar (mismo criterio que Brand/DiscountCode).
        const hasOrders = await prisma.orderBundleItem.findFirst({ where: { bundleId: formId } })
        if (hasOrders) {
            return res.status(400).json({ message: 'Tiene pedidos asociados' })
        }

        if (bundleExist.mainImage) {
            const imagePath = path.join(__dirname, "../../", bundleExist.mainImage)
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath)
        }

        const deleted = await prisma.$transaction(async (tx) => {
            // No hay onDelete: Cascade en el carrito para no perder carritos
            // activos por accidente en otros flujos; acá sí se limpia porque el
            // combo en sí está siendo eliminado.
            await tx.cartBundleItem.deleteMany({ where: { bundleId: formId } })
            await tx.productBundleItem.deleteMany({ where: { bundleId: formId } })
            return tx.productBundle.delete({ where: { id: formId } })
        })

        return res.status(200).json({ message: 'Combo eliminado', data: deleted })
    } catch (error) {
        console.error('Error al eliminar combo:', error)
        return res.status(500).json({ message: 'Error interno' })
    }
}

const allProductBundle = async (req, res) => {
    try {
        const all = await prisma.productBundle.findMany({
            include: BUNDLE_INCLUDE,
            orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        })

        if (all.length === 0) {
            return res.status(200).json({ message: 'no existen registros aun' })
        }

        // Autocorrige a inactivos los combos que se quedaron sin stock desde
        // la última vez que se guardaron o revisaron.
        const reconciled = await reconcileBundlesActiveState(all)

        return res.status(200).json({ data: reconciled })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Error interno' })
    }
}

const searchProductBundle = async (req, res) => {
    try {
        const q = (req.query.q || "").trim();
        if (!q) return res.status(200).json({ data: [] });

        const bundles = await prisma.productBundle.findMany({
            where: {
                OR: [
                    { name: { contains: q } },
                    { slug: { contains: q } },
                ],
            },
            include: BUNDLE_INCLUDE,
            take: 20,
        });

        const reconciled = await reconcileBundlesActiveState(bundles);

        return res.status(200).json({ data: reconciled });
    } catch (error) {
        console.error("Error searching product bundles:", error);
        return res.status(500).json({ message: "Error al buscar" });
    }
};

const getPublicProductBundles = async (req, res) => {
    try {
        const bundles = await prisma.productBundle.findMany({
            where: { isActive: true },
            include: BUNDLE_INCLUDE,
            orderBy: { createdAt: "desc" },
        });

        // Si alguno se quedó sin stock, se desactiva acá y se saca del
        // listado público (para el admin sí debe seguir siendo visible,
        // por eso allProductBundle/searchProductBundle no filtran).
        const reconciled = await reconcileBundlesActiveState(bundles);
        const stillActive = reconciled.filter((b) => b.isActive);

        return res.status(200).json({ data: stillActive });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};

const getPublicProductBundleBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const bundle = await prisma.productBundle.findFirst({
            where: { slug, isActive: true },
            include: BUNDLE_INCLUDE,
        });
        if (!bundle) return res.status(404).json({ message: "Combo no encontrado" });

        const reconciled = await reconcileBundleActiveState(bundle);
        if (!reconciled.isActive) return res.status(404).json({ message: "Combo no encontrado" });

        return res.status(200).json({ data: reconciled });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};

module.exports = {
    createProductBundle,
    updateProductBundle,
    deleteProductBundle,
    allProductBundle,
    searchProductBundle,
    getPublicProductBundles,
    getPublicProductBundleBySlug,
}
