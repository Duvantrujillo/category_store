import {
  ShoppingCart, TrendingUp, Truck, RotateCcw,
  Package, AlertTriangle, Clock, CheckCircle2,
  RefreshCw, Loader2,
} from 'lucide-react';
import { useDashboard } from './hooks/useDashboard';

const fmt = (n) =>
  Number(n ?? 0).toLocaleString('es-CO');

const fmtCurrency = (n) =>
  `$${Number(n ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;

function StatCard({ icon: Icon, label, value, sub, color, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-5 flex items-start gap-3 sm:gap-4">
      <div className={`flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl shrink-0 ${color}`}>
        <Icon size={17} className="text-white" />
      </div>
      <div className="min-w-0">
        {loading ? (
          <div className="h-6 w-16 bg-slate-100 rounded animate-pulse mb-1" />
        ) : (
          <p className="text-lg sm:text-2xl font-bold text-slate-800 leading-none">{value}</p>
        )}
        <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1 leading-tight">{label}</p>
        {sub && (
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-tight">{sub}</p>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
      {children}
    </h2>
  );
}

export default function AdminHome() {
  const { stats, loading, error, refetch } = useDashboard();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
        <AlertTriangle size={32} className="opacity-50" />
        <p className="text-sm">No se pudieron cargar las estadísticas.</p>
        <button
          onClick={refetch}
          className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
        >
          <RefreshCw size={12} /> Reintentar
        </button>
      </div>
    );
  }

  const s = stats ?? {};

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Resumen general</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Vista rápida del estado de tu tienda
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-40"
        >
          {loading
            ? <Loader2 size={13} className="animate-spin" />
            : <RefreshCw size={13} />
          }
          Actualizar
        </button>
      </div>

      {/* Órdenes */}
      <div>
        <SectionTitle>Órdenes</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={ShoppingCart}
            label="Total de órdenes"
            value={fmt(s.orders?.total)}
            sub={`${fmt(s.orders?.thisMonth)} este mes`}
            color="bg-indigo-500"
            loading={loading}
          />
          <StatCard
            icon={CheckCircle2}
            label="Órdenes pagadas"
            value={fmt(s.orders?.PAID)}
            color="bg-green-500"
            loading={loading}
          />
          <StatCard
            icon={Clock}
            label="Órdenes pendientes"
            value={fmt(s.orders?.PENDING)}
            sub="Requieren atención"
            color="bg-amber-500"
            loading={loading}
          />
          <StatCard
            icon={TrendingUp}
            label="Ingresos totales"
            value={fmtCurrency(s.revenue?.total)}
            sub={`${fmtCurrency(s.revenue?.thisMonth)} este mes`}
            color="bg-emerald-500"
            loading={loading}
          />
        </div>
      </div>

      {/* Envíos */}
      <div>
        <SectionTitle>Envíos</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Truck}
            label="Sin procesar"
            value={fmt(s.shipments?.CREATED)}
            sub="Estado: Creado"
            color="bg-slate-500"
            loading={loading}
          />
          <StatCard
            icon={Package}
            label="En preparación"
            value={fmt(s.shipments?.PREPARING)}
            color="bg-amber-500"
            loading={loading}
          />
          <StatCard
            icon={Truck}
            label="En camino"
            value={fmt(s.shipments?.SHIPPED)}
            color="bg-blue-500"
            loading={loading}
          />
          <StatCard
            icon={CheckCircle2}
            label="Entregados"
            value={fmt(s.shipments?.DELIVERED)}
            color="bg-green-500"
            loading={loading}
          />
        </div>
      </div>

      {/* Devoluciones */}
      <div>
        <SectionTitle>Devoluciones</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={RotateCcw}
            label="Últimos 30 días"
            value={fmt(s.returns?.last30Days)}
            sub="Total del período"
            color="bg-rose-500"
            loading={loading}
          />
          <StatCard
            icon={Clock}
            label="Pendientes"
            value={fmt(s.returns?.PENDING)}
            sub="Requieren revisión"
            color="bg-amber-500"
            loading={loading}
          />
          <StatCard
            icon={CheckCircle2}
            label="Aprobadas"
            value={fmt(s.returns?.APPROVED)}
            color="bg-blue-500"
            loading={loading}
          />
          <StatCard
            icon={CheckCircle2}
            label="Completadas"
            value={fmt(s.returns?.COMPLETED)}
            color="bg-green-500"
            loading={loading}
          />
        </div>
      </div>

      {/* Inventario */}
      <div>
        <SectionTitle>Inventario</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Package}
            label="Productos activos"
            value={fmt(s.products?.active)}
            color="bg-indigo-500"
            loading={loading}
          />
          <StatCard
            icon={AlertTriangle}
            label="Sin stock"
            value={fmt(s.products?.lowStock)}
            sub="Variantes agotadas"
            color="bg-rose-500"
            loading={loading}
          />
        </div>
      </div>

    </div>
  );
}
