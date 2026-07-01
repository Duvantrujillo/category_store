import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { searchProduct } from "@/api/productApi";

/* ── Combobox de búsqueda de productos ─────────────────────── */
function ProductSearchCombobox({ onChange, initialProduct }) {
    const [open, setOpen]       = useState(false);
    const [query, setQuery]     = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(initialProduct ?? null);
    const containerRef = useRef(null);
    const inputRef     = useRef(null);

    // Sincronizar selección inicial (modo edición)
    useEffect(() => {
        if (initialProduct && !selected) setSelected(initialProduct);
    }, [initialProduct]);

    // Al abrir sin query: cargar productos activos inmediatamente
    useEffect(() => {
        if (!open || query.trim()) return;
        setLoading(true);
        searchProduct("").then(res => setResults(res.data ?? [])).catch(() => setResults([])).finally(() => setLoading(false));
    }, [open]);

    // Búsqueda con debounce cuando el usuario escribe
    useEffect(() => {
        if (!query.trim()) return;
        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await searchProduct(query);
                setResults(res.data ?? []);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [query]);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = () => {
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 40);
    };

    const handleSelect = (product) => {
        setSelected(product);
        onChange(product.id);
        setOpen(false);
        setQuery("");
        setResults([]);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setSelected(null);
        onChange(null);
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={handleOpen}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
            >
                {selected ? (
                    <span className="flex items-center gap-1 truncate min-w-0">
                        <span className="truncate font-medium">{selected.name}</span>
                        {selected.brand?.name && (
                            <span className="text-muted-foreground text-xs shrink-0">
                                — {selected.brand.name}
                            </span>
                        )}
                    </span>
                ) : (
                    <span className="text-muted-foreground">Seleccionar producto</span>
                )}
                <span className="flex items-center gap-1 ml-2 shrink-0">
                    {selected && (
                        <X
                            size={13}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            onClick={handleClear}
                        />
                    )}
                    <ChevronDown size={14} className="text-muted-foreground" />
                </span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-full min-w-[280px] rounded-md border border-slate-200 bg-white shadow-lg">
                    {/* Input de búsqueda */}
                    <div className="flex items-center gap-2 border-b border-slate-100 px-3">
                        <Search size={13} className="text-muted-foreground shrink-0" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Nombre, marca, categoría, slug..."
                            className="flex-1 py-2.5 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
                        />
                    </div>

                    {/* Resultados */}
                    <div className="max-h-56 overflow-y-auto">
                        {loading && (
                            <p className="px-3 py-3 text-xs text-muted-foreground text-center">
                                Buscando...
                            </p>
                        )}
                        {!loading && query.trim() && results.length === 0 && (
                            <p className="px-3 py-3 text-xs text-muted-foreground text-center">
                                Sin resultados para "{query}"
                            </p>
                        )}
                        {results.map((product) => (
                            <button
                                key={product.id}
                                type="button"
                                onClick={() => handleSelect(product)}
                                className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                            >
                                <span className="text-sm font-medium text-slate-800 truncate">
                                    {product.name}
                                </span>
                                {product.brand?.name && (
                                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                        {product.brand.name}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Sección de información básica ─────────────────────────── */
export default function BasicInfoSection({ form, handleChange, initialProduct }) {
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
                        <ProductSearchCombobox
                            onChange={(id) => handleChange("productId", id)}
                            initialProduct={initialProduct}
                        />
                    </div>

                    {/* BARCODE */}
                    <div>
                        <Label>Barcode</Label>
                        <Input
                            type="text"
                            value={form.barcode || ""}
                            onChange={(e) => handleChange("barcode", e.target.value)}
                            placeholder="Código de barras"
                        />
                    </div>

                </div>

            </section>

            {/* INVENTARIO Y VENTAS */}
            <section className="space-y-4 border-t pt-4">

                <div>
                    <h3 className="text-sm font-semibold">Inventario y Ventas</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">

                    {/* PRECIO */}
                    <div>
                        <Label>Precio</Label>
                        <Input
                            type="number"
                            min="0"
                            value={form.price || ""}
                            onChange={(e) => handleChange("price", e.target.value)}
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
                            onChange={(e) => handleChange("stock", e.target.value)}
                            placeholder="0"
                        />
                    </div>

                </div>

                <div className="grid grid-cols-2 gap-4">

                    {/* VARIANTE PRINCIPAL */}
                    <div>
                        <Label>Principal</Label>
                        <Select
                            value={form.isDefault ? "true" : "false"}
                            onValueChange={(v) => handleChange("isDefault", v === "true")}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Sí</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ESTADO */}
                    <div>
                        <Label>Estado</Label>
                        <Select
                            value={form.isActive ? "true" : "false"}
                            onValueChange={(v) => handleChange("isActive", v === "true")}
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
