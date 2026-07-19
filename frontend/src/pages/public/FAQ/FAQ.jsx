import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, MessageCircle, Mail, ShieldCheck, Clock3, PackageCheck, RotateCcw, BadgeCheck, Camera } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import HomeHeader from "../Home/components/header/HomeHeader";
import HomeFooter from "../Home/components/footer/HomeFooter";
import HomeCart from "../Home/components/cart/HomeCart";
import { usePublicCart } from "../Home/hooks/usePublicCart";
import { usePublicWishlist } from "../Home/hooks/usePublicWishlist";
import { usePageTitle } from "@/hooks/usePageTitle";

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? "";
const SUPPORT_EMAIL = "hola@bloombeauty.com";

const FAQ_GROUPS = [
    {
        title: "Pedidos y compra",
        icon: PackageCheck,
        items: [
            {
                q: "¿Cómo sé si mi pedido fue confirmado?",
                a: "Recibirás una confirmación por los canales disponibles después de completar la compra. Si no la ves, revisa tu correo y tu carpeta de spam.",
            },
            {
                q: "¿Puedo cambiar la dirección después de pagar?",
                a: "Depende del estado de preparación del pedido. Si todavía no ha sido despachado, escríbenos de inmediato para revisarlo.",
            },
            {
                q: "¿Qué hago si me equivoqué al elegir un producto?",
                a: "Contáctanos lo antes posible con tu número de pedido. Si aún no sale del almacén, evaluamos si es posible corregirlo.",
            },
        ],
    },
    {
        title: "Envíos y seguimiento",
        icon: Clock3,
        items: [
            {
                q: "¿Cuánto tarda el envío?",
                a: "El tiempo depende de tu ubicación y del estado logístico del pedido. Te informamos el avance con la mayor claridad posible.",
            },
            {
                q: "¿Cómo hago seguimiento a mi pedido?",
                a: "Puedes consultar tu pedido desde la sección de seguimiento o escribirnos si necesitas ayuda con el estado del envío.",
            },
            {
                q: "¿Qué pasa si el mensajero no me encuentra?",
                a: "Puede requerirse un segundo intento de entrega o una coordinación adicional según la transportadora asignada.",
            },
        ],
    },
    {
        title: "Cambios y devoluciones",
        icon: RotateCcw,
        items: [
            {
                q: "¿En cuánto tiempo puedo solicitar una devolución?",
                a: "Tienes 15 días hábiles desde la recepción del pedido para revisar tu caso y escribirnos si aplica.",
            },
            {
                q: "¿Puedo devolver un producto abierto?",
                a: "Solo si llegó defectuoso, equivocado o con una falla de calidad. Por higiene, los productos abiertos normalmente no aplican para devolución.",
            },
            {
                q: "¿Qué debo enviar para iniciar el proceso?",
                a: "Tu número de pedido, una breve descripción y, si aplica, fotos del producto o del empaque para revisar el caso más rápido.",
            },
        ],
    },
];

function FaqCard({ icon: Icon, title, items }) {
    return (
        <section className="rounded-[2rem] border border-rose-100 bg-white/95 p-5 shadow-sm shadow-rose-100/60 backdrop-blur-sm sm:p-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-rose-400 to-fuchsia-400 text-white shadow-sm shadow-rose-200">
                    <Icon size={16} />
                </div>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-500">Ayuda</p>
                    <h2 className="mt-1 text-base font-semibold text-rose-950 sm:text-lg">{title}</h2>
                </div>
            </div>

            <div className="mt-5 space-y-3">
                {items.map((item) => (
                    <details key={item.q} className="group rounded-2xl border border-rose-100 bg-rose-50/60 p-4 open:bg-rose-50">
                        <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 rounded-xl text-left select-none">
                            <span className="min-w-0 flex-1 text-sm font-semibold text-rose-950">{item.q}</span>
                            <BadgeCheck size={15} className="shrink-0 text-rose-400 transition-transform group-open:rotate-180" />
                        </summary>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{item.a}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}

export default function FAQ() {
    usePageTitle("Preguntas frecuentes");
    const navigate = useNavigate();

    const {
        cartItems, cartBundleItems, cartOpen, setCartOpen,
        updateQty, removeFromCart, cartUuid,
        updateBundleQty, removeBundleFromCart,
        gift, initializing,
    } = usePublicCart();
    const { wishlistItems, setWishlistOpen } = usePublicWishlist(cartUuid);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
        + cartBundleItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.12),transparent_30%),radial-gradient(circle_at_80%_0,rgba(251,191,36,0.08),transparent_24%),linear-gradient(180deg,#fff7fb_0%,#fffdfd_100%)] text-slate-900">
            <HomeHeader
                cartCount={cartCount}
                onCartOpen={() => setCartOpen(true)}
                wishlistCount={wishlistItems.length}
                onWishlistOpen={() => setWishlistOpen(true)}
                onSearch={() => navigate("/")}
            />

            <div className="relative overflow-hidden border-b border-rose-100 bg-linear-to-br from-rose-50 via-pink-50 to-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.12),transparent_30%),radial-gradient(circle_at_left,rgba(244,114,182,0.1),transparent_26%)]" />
                <div className="absolute -right-12 top-4 h-40 w-40 rounded-full bg-rose-200/40 blur-3xl" />
                <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-fuchsia-200/30 blur-3xl" />
                <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-3 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-rose-500 uppercase shadow-sm shadow-rose-100/60 transition-colors hover:border-rose-300 hover:text-rose-700"
                    >
                        <ArrowLeft size={13} /> Volver
                    </button>
                    <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-3 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-rose-600 uppercase shadow-sm shadow-rose-100/70">
                        <HelpCircle size={13} /> Centro de ayuda
                    </div>
                    <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-rose-950 sm:text-4xl lg:text-5xl">
                        Preguntas frecuentes
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-rose-900/70 sm:text-base">
                        Aquí reunimos las respuestas más útiles sobre compras, envíos, cambios y devoluciones para que encuentres rápido lo que necesitas.
                    </p>
                </div>
            </div>

            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
                <div className="grid gap-5 lg:gap-6">
                    {FAQ_GROUPS.map((group) => (
                        <FaqCard key={group.title} icon={group.icon} title={group.title} items={group.items} />
                    ))}

                    <section className="rounded-[2rem] border border-rose-100 bg-white/95 p-5 shadow-sm shadow-rose-100/60 backdrop-blur-sm sm:p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-rose-400 to-fuchsia-400 text-white shadow-sm shadow-rose-200">
                                <ShieldCheck size={16} />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-500">¿No encontraste tu respuesta?</p>
                                <h2 className="mt-1 text-base font-semibold text-rose-950 sm:text-lg">Escríbenos y te ayudamos</h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                    Puedes contactarnos por WhatsApp o correo con tu número de pedido y una breve descripción del caso.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
                            {WA_NUMBER && (
                                <a
                                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("¡Hola! Tengo una consulta sobre mi pedido.")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5d]"
                                >
                                    <SiWhatsapp size={15} />
                                    WhatsApp
                                </a>
                            )}
                            <a
                                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Consulta frecuente")}`}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-900 transition-colors hover:bg-rose-50"
                            >
                                <Mail size={15} />
                                Correo
                            </a>
                        </div>
                    </section>
                </div>
            </main>

            <HomeFooter />

            <HomeCart
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                items={cartItems}
                onRemove={removeFromCart}
                onUpdateQty={updateQty}
                bundleItems={cartBundleItems}
                onRemoveBundle={removeBundleFromCart}
                onUpdateBundleQty={updateBundleQty}
                onCheckout={() => setCartOpen(false)}
                gift={gift}
                initializing={initializing}
                cartUuid={cartUuid}
            />
        </div>
    );
}
