import {
  ShoppingCart, TrendingUp, Truck, RotateCcw,
  Package, AlertTriangle, Clock, CheckCircle2,
  RefreshCw, ShieldOff, DollarSign,
  ArrowRight,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard }      from './hooks/useDashboard';
import { useHasPermission }  from '@/lib/permissions';

const fmt    = (n) => Number(n ?? 0).toLocaleString('es-CO');
const fmtCOP = (n) => `$${Number(n ?? 0).toLocaleString('es-CO')}`;

const dateLabel = new Date().toLocaleDateString('es-CO', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

/* ── subcomponentes ─────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, sub, accent, iconCls, loading }) {
  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${accent}`} />
      <div className="flex items-start justify-between gap-2 pl-1">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 leading-none mb-2.5">
            {label}
          </p>
          {loading
            ? <Skeleton className="h-7 w-20" />
            : <p className="text-2xl font-bold text-slate-800 tabular-nums leading-none">{value}</p>
          }
          {sub && <p className="text-xs text-slate-400 mt-1.5 leading-snug">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl shrink-0 ${iconCls}`}>
          <Icon size={15} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color = 'text-slate-400' }) {
  return (
    <div className="flex items-center gap-2 mb-3.5">
      <Icon size={13} className={color} />
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{title}</h2>
    </div>
  );
}

const PIPELINE = [
  { key: 'CREATED',   label: 'Creado',     cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  { key: 'PREPARING', label: 'Preparando', cls: 'bg-amber-50  text-amber-700 border-amber-200'  },
  { key: 'SHIPPED',   label: 'Enviado',    cls: 'bg-blue-50   text-blue-700  border-blue-200'   },
  { key: 'DELIVERED', label: 'Entregado',  cls: 'bg-green-50  text-green-700 border-green-200'  },
];

const RETURN_ROWS = [
  { key: 'PENDING',   label: 'Pendientes',  dot: 'bg-amber-400' },
  { key: 'APPROVED',  label: 'Aprobadas',   dot: 'bg-blue-400'  },
  { key: 'COMPLETED', label: 'Completadas', dot: 'bg-green-400' },
];

/* ── componente principal ───────────────────────────────────────── */

export default function AdminHome() {
  const canView = useHasPermission('dashboard.view');
  const { stats, loading, error, refetch } = useDashboard({ skip: !canView });

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <ShieldOff size={40} className="opacity-40" />
        <p className="text-sm">No tienes permisos para visualizar esta sección.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="p-4 bg-rose-50 rounded-full border border-rose-100">
          <AlertTriangle size={24} className="text-rose-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">No se pudieron cargar las estadísticas</p>
          <p className="text-xs text-slate-400 mt-1">Verifica tu conexión o intenta de nuevo</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50"
        >
          <RefreshCw size={12} /> Reintentar
        </button>
      </div>
    );
  }

  const orders    = stats?.orders    ?? {};
  const revenue   = stats?.revenue   ?? {};
  const shipments = stats?.shipments ?? {};
  const returns   = stats?.returns   ?? {};
  const products  = stats?.products  ?? {};

  const totalShipments = PIPELINE.reduce((s, p) => s + (shipments[p.key] ?? 0), 0);
  const payRate = orders.total
    ? Math.round(((orders.PAID ?? 0) / orders.total) * 100)
    : null;

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Resumen general</h1>
          <p className="text-sm text-slate-400 mt-0.5 capitalize">{dateLabel}</p>
        </div>
      </div>

      {/* ── Alerta de stock bajo ─────────────────────────────────── */}
      {!loading && (products.lowStock ?? 0) > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <AlertTriangle size={15} className="text-rose-500 shrink-0" />
          <p className="text-sm font-semibold text-rose-700 flex-1">
            {fmt(products.lowStock)} variante{products.lowStock !== 1 ? 's' : ''} sin stock
            <span className="font-normal text-rose-600"> — requieren reabastecimiento</span>
          </p>
          <span className="text-[11px] font-medium text-rose-400 shrink-0">Inventario</span>
        </div>
      )}

      {/* ── Hero de ingresos ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-linear-to-br from-emerald-600 to-emerald-500 text-white p-6 shadow-lg shadow-emerald-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-100">
              Ingresos totales
            </p>
            {loading
              ? <div className="h-10 w-44 mt-2 rounded-xl bg-white/20 animate-pulse" />
              : <p className="text-4xl font-bold mt-1.5 tabular-nums">{fmtCOP(revenue.total)}</p>
            }
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-emerald-100 text-sm">
              <span className="flex items-center gap-1.5">
                <TrendingUp size={13} />
                {loading ? '—' : fmtCOP(revenue.thisMonth)} este mes
              </span>
              <span className="opacity-30">·</span>
              <span>{loading ? '—' : fmt(orders.total)} órdenes en total</span>
            </div>
          </div>
          <div className="p-3 bg-white/15 rounded-2xl border border-white/20 shrink-0">
            <DollarSign size={26} className="text-white" />
          </div>
        </div>
      </div>

      {/* ── Órdenes ──────────────────────────────────────────────── */}
      <div>
        <SectionHeader icon={ShoppingCart} title="Órdenes" color="text-indigo-400" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={ShoppingCart}
            label="Total órdenes"
            value={fmt(orders.total)}
            sub={`${fmt(orders.thisMonth)} este mes`}
            accent="bg-indigo-500"
            iconCls="bg-indigo-50 text-indigo-500"
            loading={loading}
          />
          <StatCard
            icon={CheckCircle2}
            label="Pagadas"
            value={fmt(orders.PAID)}
            accent="bg-green-500"
            iconCls="bg-green-50 text-green-600"
            loading={loading}
          />
          <StatCard
            icon={Clock}
            label="Pendientes"
            value={fmt(orders.PENDING)}
            sub="Requieren atención"
            accent="bg-amber-500"
            iconCls="bg-amber-50 text-amber-600"
            loading={loading}
          />
          <StatCard
            icon={TrendingUp}
            label="Tasa de pago"
            value={loading ? '—' : (payRate !== null ? `${payRate}%` : '—')}
            sub="Órdenes completadas"
            accent="bg-blue-500"
            iconCls="bg-blue-50 text-blue-500"
            loading={loading}
          />
        </div>
      </div>

      {/* ── Pipeline de envíos ───────────────────────────────────── */}
      <div>
        <SectionHeader icon={Truck} title="Envíos" color="text-blue-400" />
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {PIPELINE.map((step, i) => {
              const count = shipments[step.key] ?? 0;
              const pct   = totalShipments > 0 ? Math.round((count / totalShipments) * 100) : 0;
              return (
                <div key={step.key} className="flex sm:flex-col items-center gap-2 sm:gap-0 flex-1">
                  <div className={`flex flex-col items-center text-center rounded-xl border p-3.5 w-full ${step.cls}`}>
                    <span className="text-xs font-semibold leading-tight">{step.label}</span>
                    {loading
                      ? <div className="h-7 w-10 mt-1.5 rounded-lg bg-current opacity-10 animate-pulse" />
                      : <span className="text-2xl font-bold tabular-nums mt-1.5 leading-none">{count}</span>
                    }
                    <span className="text-[10px] opacity-40 mt-1 tabular-nums">{pct}%</span>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <ArrowRight size={14} className="text-slate-300 shrink-0 rotate-90 sm:rotate-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Devoluciones + Inventario ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Devoluciones */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <SectionHeader icon={RotateCcw} title="Devoluciones · últimos 30 días" color="text-rose-400" />
          {loading
            ? <Skeleton className="h-9 w-20 mb-4" />
            : <p className="text-3xl font-bold text-slate-800 tabular-nums mb-4">{fmt(returns.last30Days)}</p>
          }
          <div className="space-y-3">
            {RETURN_ROWS.map((row) => (
              <div key={row.key} className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${row.dot}`} />
                <span className="text-xs text-slate-500 flex-1">{row.label}</span>
                {loading
                  ? <Skeleton className="h-3.5 w-8" />
                  : <span className="text-xs font-bold text-slate-700 tabular-nums">{fmt(returns[row.key])}</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Inventario */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <SectionHeader icon={Package} title="Inventario" color="text-indigo-400" />
          <div className="space-y-3">

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <Package size={13} className="text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-indigo-700">Productos activos</span>
              </div>
              {loading
                ? <Skeleton className="h-6 w-12" />
                : <span className="text-xl font-bold text-indigo-700 tabular-nums">{fmt(products.active)}</span>
              }
            </div>

            <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
              (products.lowStock ?? 0) > 0 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${(products.lowStock ?? 0) > 0 ? 'bg-rose-100' : 'bg-slate-100'}`}>
                  <AlertTriangle size={13} className={`${(products.lowStock ?? 0) > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
                </div>
                <span className={`text-sm font-medium ${(products.lowStock ?? 0) > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                  Sin stock
                </span>
              </div>
              {loading
                ? <Skeleton className="h-6 w-8" />
                : <span className={`text-xl font-bold tabular-nums ${(products.lowStock ?? 0) > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                    {fmt(products.lowStock)}
                  </span>
              }
            </div>

            {!loading && (products.lowStock ?? 0) === 0 && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 pt-1">
                <CheckCircle2 size={12} />
                Todo el inventario tiene stock disponible
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
