import { Sparkles, Heart, Mail, Phone, MapPin } from "lucide-react";
import { SiVisa, SiMastercard, SiInstagram, SiFacebook, SiTiktok } from "react-icons/si";
import { Link } from "react-router-dom";

const LINKS = {
  tienda: [
    { label: "Todos los productos", to: "/" },
    { label: "Categorías", to: "/" },
    { label: "Marcas", to: "/" },
    { label: "Novedades", to: "/" },
    { label: "Ofertas", to: "/" },
  ],
  ayuda: [
    { label: "Cómo comprar", to: "/" },
    { label: "Envíos y entregas", to: "/" },
    { label: "Consultar mi pedido", to: "/pedido" },
    { label: "Devoluciones", to: "/devoluciones" },
    { label: "Preguntas frecuentes", to: "/preguntas-frecuentes" },
  ],
};

function FooterCol({ title, links }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-widest text-rose-400">{title}</p>
      <ul className="flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-sm text-rose-700/70 hover:text-rose-500 transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialBtn({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex items-center justify-center w-9 h-9 rounded-full border border-rose-200 text-rose-400 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-500 transition-all"
    >
      {children}
    </a>
  );
}

export default function HomeFooter() {
  return (
    <footer className="bg-white border-t border-rose-100">

      {/* Banda decorativa */}
      <div className="h-1 w-full bg-linear-to-r from-pink-200 via-rose-300 to-fuchsia-200" />

      {/* Cuerpo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">

        {/* Marca */}
        <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-400 text-white shadow-sm">
              <Sparkles size={17} />
            </div>
            <span className="font-bold text-rose-900 text-[15px] tracking-tight">
              Bloom<span className="text-rose-400">Beauty</span>
            </span>
          </Link>

          <p className="text-sm text-rose-700/60 leading-relaxed max-w-xs">
            Tu destino de belleza favorito. Productos de maquillaje y cuidado personal seleccionados con amor para ti.
          </p>

          <div className="flex items-center gap-2">
            <SocialBtn href="#" label="Instagram">
              <SiInstagram size={16} color="#E1306C" />
            </SocialBtn>
            <SocialBtn href="#" label="Facebook">
              <SiFacebook size={16} color="#1877F2" />
            </SocialBtn>
            <SocialBtn href="#" label="TikTok">
              <SiTiktok size={16} color="#010101" />
            </SocialBtn>
          </div>
        </div>

        {/* Tienda */}
        <FooterCol title="Tienda" links={LINKS.tienda} />

        {/* Ayuda */}
        <FooterCol title="Ayuda" links={LINKS.ayuda} />

        {/* Contacto */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-400">Contacto</p>
          <ul className="flex flex-col gap-3">
            <li className="flex items-start gap-2.5 text-sm text-rose-700/70">
              <Mail size={14} className="text-rose-300 mt-0.5 shrink-0" />
              hola@bloombeauty.com
            </li>
            <li className="flex items-start gap-2.5 text-sm text-rose-700/70">
              <Phone size={14} className="text-rose-300 mt-0.5 shrink-0" />
              +57 300 000 0000
            </li>
            <li className="flex items-start gap-2.5 text-sm text-rose-700/70">
              <MapPin size={14} className="text-rose-300 mt-0.5 shrink-0" />
              Colombia
            </li>
          </ul>

          <div className="mt-2">
            <p className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-2">
              Pagos seguros
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center justify-center px-2.5 py-1.5 rounded-md border border-rose-100 bg-white shadow-xs" title="Visa">
                <SiVisa size={22} color="#1A1F71" />
              </span>
              <span className="flex items-center justify-center px-2.5 py-1.5 rounded-md border border-rose-100 bg-white shadow-xs" title="Mastercard">
                <SiMastercard size={22} color="#EB001B" />
              </span>
              <span className="flex items-center justify-center px-2.5 py-1.5 rounded-md border border-rose-100 bg-white shadow-xs" title="Nequi">
                <span className="text-[11px] font-extrabold tracking-wide" style={{ color: "#430098" }}>Nequi</span>
              </span>
              <span className="flex items-center justify-center px-2.5 py-1.5 rounded-md border border-rose-100 bg-white shadow-xs" title="PSE">
                <span className="text-[11px] font-extrabold tracking-wide text-[#00A14B]">PSE</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-rose-400/70">
            © {new Date().getFullYear()} BloomBeauty. Todos los derechos reservados.
          </p>
          <p className="text-xs text-rose-300 flex items-center gap-1">
            Hecho con <Heart size={11} className="text-rose-400 fill-rose-400" /> en Colombia
          </p>
        </div>
      </div>

    </footer>
  );
}
