import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function BasicInfoSection({
    form,
    handleChange,
    products = [],
}) {
    return (
        <div className="space-y-6">

            {/* INFORMACIÓN GENERAL */}
            <section className="space-y-4">

                <div>
                    <h3 className="text-sm font-semibold">
                        Información General
                    </h3>

                    <p className="text-xs text-muted-foreground">
                        Configura el producto asociado a esta variante.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* PRODUCTO */}
                    <div>

                        <Label>Producto</Label>

                        <Select
                            value={
                                form.productId
                                    ? String(form.productId)
                                    : ""
                            }
                            onValueChange={(value) =>
                                handleChange(
                                    "productId",
                                    Number(value)
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>

                            <SelectContent>

                                {products
                                    .filter(
                                        (product) =>
                                            product.status === "ACTIVE" ||
                                            product.status === "DRAFT"
                                    )
                                    .map((product) => (

                                        <SelectItem
                                            key={product.id}
                                            value={String(product.id)}
                                        >
                                            {product.name}
                                        </SelectItem>

                                    ))}

                            </SelectContent>

                        </Select>

                    </div>

                    {/* BARCODE */}
                    <div>

                        <Label>Barcode</Label>

                        <Input
                            type="text"
                            value={form.barcode || ""}
                            onChange={(e) =>
                                handleChange(
                                    "barcode",
                                    e.target.value
                                )
                            }
                            placeholder="Código de barras"
                        />

                    </div>

                </div>

            </section>

            {/* INVENTARIO Y VENTAS */}
            <section className="space-y-4 border-t pt-4">

                <div>
                    <h3 className="text-sm font-semibold">
                        Inventario y Ventas
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">

                    {/* PRECIO */}
                    <div>

                        <Label>Precio</Label>

                        <Input
                            type="number"
                            min="0"
                            value={form.price || ""}
                            onChange={(e) =>
                                handleChange(
                                    "price",
                                    e.target.value
                                )
                            }
                            placeholder="0"
                        />

                    </div>

                    {/* STOCK */}
                    <div>

                        <Label>Stock</Label>

                        <Input
                            type="number"
                            min="0"
                            value={form.stock || ""}
                            onChange={(e) =>
                                handleChange(
                                    "stock",
                                    e.target.value
                                )
                            }
                            placeholder="0"
                        />

                    </div>

                </div>

                <div className="grid grid-cols-2 gap-4">

                    {/* VARIANTE PRINCIPAL */}
                    <div>

                        <Label>Principal</Label>

                        <Select
                            value={
                                form.isDefault
                                    ? "true"
                                    : "false"
                            }
                            onValueChange={(value) =>
                                handleChange(
                                    "isDefault",
                                    value === "true"
                                )
                            }
                        >

                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>

                                <SelectItem value="true">
                                    Sí
                                </SelectItem>

                                <SelectItem value="false">
                                    No
                                </SelectItem>

                            </SelectContent>

                        </Select>

                    </div>

                    {/* ESTADO */}
                    <div>

                        <Label>Estado</Label>

                        <Select
                            value={
                                form.isActive
                                    ? "true"
                                    : "false"
                            }
                            onValueChange={(value) =>
                                handleChange(
                                    "isActive",
                                    value === "true"
                                )
                            }
                        >

                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>

                                <SelectItem value="true">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span>Activo</span>
                                    </div>
                                </SelectItem>

                                <SelectItem value="false">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                        <span>Inactivo</span>
                                    </div>
                                </SelectItem>

                            </SelectContent>

                        </Select>

                    </div>

                </div>

            </section>

        </div>
    );
}