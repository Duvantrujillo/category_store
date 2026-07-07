import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

function LoginForm({ form, handleChange, handleSubmit, loading }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">

      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">

        {/* Círculos decorativos de fondo */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-900/60">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base tracking-wide leading-none">Category Store</p>
            <p className="text-indigo-400 text-[10px] font-medium uppercase tracking-widest mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Contenido central */}
        <div className="relative space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight leading-snug">
              Gestiona tu tienda<br />
              <span className="text-indigo-400">desde un solo lugar</span>
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-xs">
              Controla inventario, pedidos, envíos y devoluciones con visibilidad total en tiempo real.
            </p>
          </div>

          <ul className="space-y-3.5">
            {[
              "Dashboard con métricas en tiempo real",
              "Gestión de pedidos y envíos",
              "Control de inventario y variantes",
              "Sistema de permisos por rol",
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-2.5 text-sm text-slate-300">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 shrink-0">
                  <ArrowRight size={10} className="text-indigo-400" />
                </span>
                {feat}
              </li>
            ))}
          </ul>
        </div>

        {/* Pie del panel */}
        <p className="relative text-[11px] text-slate-600">
          © {new Date().getFullYear()} Category Store. Todos los derechos reservados.
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 shadow-md shadow-indigo-200">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <p className="font-bold text-slate-800 text-base">Category Store</p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-slate-500 text-sm mt-1.5">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Correo electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@ejemplo.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200 mt-2"
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

          {/*
            Registro público deshabilitado a propósito — no se elimina el
            código por si se quiere reactivar más adelante, pero no debe
            haber ninguna forma de que un usuario llegue a /register desde
            esta pantalla. La ruta en App.jsx también redirige a /login.

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
              Crear cuenta
            </Link>
          </p>
          */}

        </div>
      </div>
    </div>
  );
}

export default LoginForm;
