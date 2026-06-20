import {
  LayoutGrid, Package, Layers, Award, Settings, List,
  FileText, ClipboardList, Truck, RotateCcw, CreditCard,
  LayoutDashboard, BarChart2, KeyRound,
} from 'lucide-react'

export const MODULE_CONFIG = {
  categories:          { label: 'Categorías',                    icon: LayoutGrid,    color: 'indigo'   },
  products:            { label: 'Productos',                     icon: Package,       color: 'violet'   },
  'product-variants':  { label: 'Variantes',                     icon: Layers,        color: 'purple'   },
  brands:              { label: 'Marcas',                        icon: Award,         color: 'rose'     },
  attributes:          { label: 'Atributos',                     icon: Settings,      color: 'sky'      },
  'attribute-values':  { label: 'Valores de atributo',           icon: List,          color: 'teal'     },
  forms:               { label: 'Formularios',                   icon: FileText,      color: 'emerald'  },
  orders:              { label: 'Órdenes y envíos (consulta)',   icon: ClipboardList, color: 'blue'     },
  shipments:           { label: 'Envíos (actualizar)',           icon: Truck,         color: 'cyan'     },
  returns:             { label: 'Devoluciones',                  icon: RotateCcw,     color: 'orange'   },
  refunds:             { label: 'Reembolsos',                    icon: CreditCard,    color: 'red'      },
  dashboard:           { label: 'Dashboard',                     icon: LayoutDashboard, color: 'fuchsia'},
  reports:             { label: 'Reportes',                      icon: BarChart2,     color: 'green'    },
  permissions:         { label: 'Permisos del sistema',          icon: KeyRound,      color: 'amber'    },
}

export const MODULE_COLORS = {
  indigo:  { icon: 'text-indigo-600 bg-indigo-50',   bar: 'bg-indigo-500',  badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'   },
  violet:  { icon: 'text-violet-600 bg-violet-50',   bar: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700 border-violet-200'   },
  purple:  { icon: 'text-purple-600 bg-purple-50',   bar: 'bg-purple-500',  badge: 'bg-purple-50 text-purple-700 border-purple-200'   },
  rose:    { icon: 'text-rose-600 bg-rose-50',        bar: 'bg-rose-500',    badge: 'bg-rose-50 text-rose-700 border-rose-200'         },
  sky:     { icon: 'text-sky-600 bg-sky-50',          bar: 'bg-sky-500',     badge: 'bg-sky-50 text-sky-700 border-sky-200'           },
  teal:    { icon: 'text-teal-600 bg-teal-50',        bar: 'bg-teal-500',    badge: 'bg-teal-50 text-teal-700 border-teal-200'         },
  emerald: { icon: 'text-emerald-600 bg-emerald-50',  bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'},
  blue:    { icon: 'text-blue-600 bg-blue-50',        bar: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border-blue-200'         },
  cyan:    { icon: 'text-cyan-600 bg-cyan-50',        bar: 'bg-cyan-500',    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200'         },
  orange:  { icon: 'text-orange-600 bg-orange-50',    bar: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-700 border-orange-200'   },
  red:     { icon: 'text-red-600 bg-red-50',          bar: 'bg-red-500',     badge: 'bg-red-50 text-red-700 border-red-200'           },
  fuchsia: { icon: 'text-fuchsia-600 bg-fuchsia-50',  bar: 'bg-fuchsia-500', badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'},
  green:   { icon: 'text-green-600 bg-green-50',      bar: 'bg-green-500',   badge: 'bg-green-50 text-green-700 border-green-200'      },
  pink:    { icon: 'text-pink-600 bg-pink-50',        bar: 'bg-pink-500',    badge: 'bg-pink-50 text-pink-700 border-pink-200'         },
  amber:   { icon: 'text-amber-600 bg-amber-50',      bar: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200'      },
}

export const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Administrador' }
