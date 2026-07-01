import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function InfoSection({ form, handleChange, categories = [], brands = [] }) {
    const leafCategories = categories.filter(
        (cat) => !categories.some((c) => c.parentId === cat.id)
    );

    return (
        <div className="space-y-6">

            <section className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold">Información General</h3>
                    <p className="text-xs text-muted-foreground">
                        Datos principales del producto.
                    </p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="name">Nombre del Producto *</Label>
                    <Input
                        id="name"
                        value={form.name || ""}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Ej: Laptop Dell XPS 15"
                    />
                </div>
            </section>

            <section className="space-y-4 border-t pt-4">
                <div>
                    <h3 className="text-sm font-semibold">Clasificación</h3>
                    <p className="text-xs text-muted-foreground">
                        Categoría, marca y estado de publicación.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">

                    <div className="grid gap-2">
                        <Label htmlFor="category">Categoría *</Label>
                        <Select
                            value={form.categoryId ? String(form.categoryId) : ""}
                            onValueChange={(val) => handleChange("categoryId", val)}
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                                {leafCategories.length > 0 ? (
                                    leafCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-sm text-muted-foreground">
                                        Sin categorías
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="brand">Marca</Label>
                        <Select
                            value={form.brandId ? String(form.brandId) : "__none__"}
                            onValueChange={(val) => handleChange("brandId", val === "__none__" ? "" : val)}
                        >
                            <SelectTrigger id="brand">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">Sin marca</SelectItem>
                                {brands.map((brand) => (
                                    <SelectItem key={brand.id} value={String(brand.id)}>
                                        {brand.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Estado *</Label>
                        <Select
                            value={form.status || "DRAFT"}
                            onValueChange={(val) => handleChange("status", val)}
                        >
                            <SelectTrigger id="status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DRAFT">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                        <span>Borrador</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="ACTIVE">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        <span>Activo</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="INACTIVE">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full" />
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
