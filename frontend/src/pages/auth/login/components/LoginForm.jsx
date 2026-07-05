import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Loader2 } from "lucide-react";

function LoginForm({ form, handleChange, handleSubmit, loading }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">

      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-rose-400 via-rose-500 to-fuchsia-600 flex-col justify-between p-12 relative overflow-hidden">

        {/* Círculos decorativos de fondo */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-2.5 w-fit group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/25 text-white shadow-sm group-hover:bg-white/35 transition-colors">
            <Sparkles size={18} />
          </div>
          <span className="font-bold italic text-white text-lg tracking-tight leading-none">
            Wow<span className="text-white/75">Beauty</span>
          </span>
        </Link>

        {/* Contenido central */}
        <div className="relative space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight leading-snug">
              Bienvenida de nuevo,<br />
              <span className="text-white/80">tu belleza te espera</span>
            </h2>
            <p className="text-white/70 text-sm mt-3 leading-relaxed max-w-xs">
              Inicia sesión para ver tus pedidos, tus favoritos y descubrir novedades pensadas para ti.
            </p>
          </div>

          <ul className="space-y-3.5">
            {[
              "Sigue tus pedidos en tiempo real",
              "Guarda tus productos favoritos",
              "Checkout más rápido la próxima vez",
              "Ofertas y novedades primero",
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-2.5 text-sm text-white/90">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 border border-white/30 shrink-0">
                  <ArrowRight size={10} className="text-white" />
                </span>
                {feat}
              </li>
            ))}
          </ul>
        </div>

        {/* Pie del panel */}
        <p className="relative text-[11px] text-white/60">
          © {new Date().getFullYear()} WowBeauty. Todos los derechos reservados.
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center bg-rose-50/40 p-6">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <Link to="/" className="flex items-center gap-2.5 mb-8 lg:hidden w-fit">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-400 text-white shadow-md shadow-rose-200">
              <Sparkles size={17} />
            </div>
            <span className="font-bold italic text-rose-900 text-base">
              Wow<span className="text-rose-400">Beauty</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Bienvenida de nuevo</h1>
            <p className="text-gray-500 text-sm mt-1.5">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-shadow shadow-sm"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-shadow shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 active:bg-rose-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-rose-200 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight size={15} />
                </>
              )}
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="font-semibold text-rose-500 hover:text-rose-600 hover:underline transition-colors">
              Crear cuenta
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default LoginForm;
