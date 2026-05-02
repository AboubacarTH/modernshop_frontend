import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, Package,
  Euro, Star, ArrowUpRight, ArrowDownRight, Minus,
  RefreshCw, AlertCircle,
} from 'lucide-react';
import api from '@/lib/api';
import clsx from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashData {
  total_revenue:    number;
  total_orders:     number;
  total_products:   number;
  total_users:      number;
  period_revenue:   number;
  period_orders:    number;
  period_customers: number;
  revenue_trend:    number | null;
  orders_trend:     number | null;
  customers_trend:  number | null;
  revenue_chart:    { label: string; revenue: number; orders: number }[];
  category_data:    { name: string; value: number; revenue: number; color: string }[];
  top_products:     { id: number; name: string; sales: number; revenue: number; rating: number }[];
  daily_orders:     { day: string; orders: number }[];
  recent_orders:    { id: number; reference: string; status: string; total: number; created_at: string; user: { name: string } }[];
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl p-3 shadow-2xl text-sm min-w-[140px]">
      <p className="font-semibold text-dark-700 dark:text-dark-300 mb-2 text-xs uppercase tracking-wide">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-dark-500 dark:text-dark-400 capitalize">{p.name}</span>
          </div>
          <span className="font-bold text-dark-900 dark:text-white">
            {p.name === 'revenue' ? `€${Number(p.value).toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Trend badge ──────────────────────────────────────────────────────────────
function Trend({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-dark-400 dark:text-dark-500 flex items-center gap-1"><Minus size={11} /> No data</span>;
  const up = value >= 0;
  return (
    <span className={clsx(
      'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
      up ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
         : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    )}>
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {up ? '+' : ''}{value}%
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, iconClass, trend, loading }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; iconClass: string;
  trend?: number | null; loading?: boolean;
}) {
  return (
    <div className="card dark:bg-dark-800 dark:border-dark-700 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconClass)}>
          <Icon size={20} />
        </div>
        {trend !== undefined && <Trend value={trend ?? null} />}
      </div>
      {loading ? (
        <div className="skeleton h-8 w-28 rounded-lg" />
      ) : (
        <p className="text-2xl font-bold text-dark-900 dark:text-white leading-none">{value}</p>
      )}
      <div>
        <p className="text-sm font-medium text-dark-600 dark:text-dark-400">{label}</p>
        {sub && <p className="text-xs text-dark-400 dark:text-dark-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Period selector ──────────────────────────────────────────────────────────
function PeriodSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = [
    { v: '7d',  label: '7 days' },
    { v: '30d', label: '30 days' },
    { v: '90d', label: '90 days' },
    { v: '1y',  label: '1 year' },
  ];
  return (
    <div className="flex bg-dark-100 dark:bg-dark-700 rounded-xl p-1 gap-1">
      {opts.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={clsx(
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap',
            value === o.v
              ? 'bg-white dark:bg-dark-600 text-dark-900 dark:text-white shadow-sm'
              : 'text-dark-500 dark:text-dark-400 hover:text-dark-800 dark:hover:text-dark-200'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Empty chart placeholder ──────────────────────────────────────────────────
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-dark-400 dark:text-dark-500">
      <AlertCircle size={28} className="opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminAnalytics() {
  const [period, setPeriod] = useState('30d');

  const { data, isLoading, isError, refetch, isFetching } = useQuery<DashData>({
    queryKey: ['admin-dashboard', period],
    queryFn:  () => api.get('/admin/dashboard', { params: { period } }).then(r => r.data),
    staleTime: 60_000,
  });

  // ── Stat cards config ──────────────────────────────────────────────────────
  const stats = [
    {
      label: 'Total Revenue',
      value: data ? `€${Number(data.total_revenue).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—',
      sub: `€${data ? Number(data.period_revenue).toLocaleString() : '—'} this period`,
      icon: Euro,
      iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
      trend: data?.revenue_trend,
    },
    {
      label: 'Total Orders',
      value: data ? Number(data.total_orders).toLocaleString() : '—',
      sub: `${data?.period_orders ?? '—'} this period`,
      icon: ShoppingBag,
      iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
      trend: data?.orders_trend,
    },
    {
      label: 'Active Products',
      value: data ? Number(data.total_products).toLocaleString() : '—',
      sub: 'Listed in store',
      icon: Package,
      iconClass: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
      trend: undefined,
    },
    {
      label: 'Customers',
      value: data ? Number(data.total_users).toLocaleString() : '—',
      sub: `${data?.period_customers ?? '—'} joined this period`,
      icon: Users,
      iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
      trend: data?.customers_trend,
    },
  ];

  const chartData = data?.revenue_chart ?? [];
  const hasChart  = chartData.length > 0;

  const categoryData = data?.category_data ?? [];
  const hasCat       = categoryData.length > 0;

  const topProducts  = data?.top_products ?? [];
  const maxRevenue   = topProducts[0]?.revenue ?? 1;

  const recentOrders = data?.recent_orders ?? [];

  const STATUS_COLORS: Record<string, string> = {
    pending:    'badge-warning',
    confirmed:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    shipped:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered:  'badge-success',
    cancelled:  'badge-danger',
    refunded:   'badge-secondary',
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-dark-900 dark:text-white">Analytics</h2>
          <p className="text-dark-500 dark:text-dark-400 text-sm mt-0.5">
            Real-time store performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector value={period} onChange={setPeriod} />
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-dark-500 dark:text-dark-400"
            title="Refresh"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Error state ── */}
      {isError && (
        <div className="card dark:bg-dark-800 dark:border-dark-700 p-6 flex items-center gap-3 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-700 dark:text-red-400">Failed to load dashboard</p>
            <p className="text-sm text-red-600 dark:text-red-500 mt-0.5">Make sure the backend is running and you are logged in as admin.</p>
          </div>
          <button onClick={() => refetch()} className="ml-auto btn-danger btn-sm">Retry</button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <StatCard key={s.label} {...s} loading={isLoading} />
        ))}
      </div>

      {/* ── Revenue & Orders area chart ── */}
      <div className="card dark:bg-dark-800 dark:border-dark-700 p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-dark-900 dark:text-white">Revenue & Orders</h3>
            <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">
              {period === '1y' ? 'Monthly breakdown' : `Last ${period}`}
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs text-dark-500 dark:text-dark-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-primary-500 inline-block rounded-full" /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-400 inline-block rounded-full" /> Orders
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="skeleton h-64 rounded-xl" />
        ) : !hasChart ? (
          <div className="h-64">
            <EmptyChart message="No orders in this period yet" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="rev"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `€${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                width={55}
              />
              <YAxis
                yAxisId="ord"
                orientation="right"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                yAxisId="rev" type="monotone" dataKey="revenue" name="revenue"
                stroke="#f97316" strokeWidth={2.5} fill="url(#revGrad)"
                dot={false} activeDot={{ r: 5, fill: '#f97316', strokeWidth: 0 }}
              />
              <Area
                yAxisId="ord" type="monotone" dataKey="orders" name="orders"
                stroke="#60a5fa" strokeWidth={2} fill="url(#ordGrad)"
                dot={false} activeDot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Category pie + Top products ── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Category breakdown */}
        <div className="card dark:bg-dark-800 dark:border-dark-700 p-5">
          <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Sales by Category</h3>
          {isLoading ? (
            <div className="skeleton h-44 rounded-xl" />
          ) : !hasCat ? (
            <div className="h-44"><EmptyChart message="No sales data yet" /></div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="45%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryData} cx="50%" cy="50%"
                    innerRadius={48} outerRadius={72}
                    paddingAngle={3} dataKey="value"
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any, _: any, props: any) => [
                      `€${Number(props.payload.revenue).toLocaleString()} (${v}%)`, 'Revenue'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5">
                {categoryData.map(c => (
                  <div key={c.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-sm text-dark-700 dark:text-dark-300 truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-dark-400 dark:text-dark-500">
                        €{Number(c.revenue).toLocaleString()}
                      </span>
                      <span className="text-sm font-bold text-dark-900 dark:text-white w-10 text-right">
                        {c.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="card dark:bg-dark-800 dark:border-dark-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-900 dark:text-white">Top Products</h3>
            <span className="text-xs text-dark-500 dark:text-dark-400">by revenue · {period}</span>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-10 rounded-lg" />)}
            </div>
          ) : topProducts.length === 0 ? (
            <EmptyChart message="No sales in this period" />
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-dark-400 dark:text-dark-500 flex-shrink-0 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{p.name}</p>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {p.rating > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-500">
                            <Star size={11} className="fill-amber-400" />
                            {p.rating.toFixed(1)}
                          </span>
                        )}
                        <span className="text-xs text-dark-500 dark:text-dark-400">{p.sales} sold</span>
                        <span className="text-sm font-bold text-dark-900 dark:text-white">
                          €{p.revenue >= 1000 ? `${(p.revenue / 1000).toFixed(1)}k` : p.revenue}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-700"
                        style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Daily orders sparkline ── */}
      {data?.daily_orders && data.daily_orders.length > 0 && (
        <div className="card dark:bg-dark-800 dark:border-dark-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-dark-900 dark:text-white">Orders per Day</h3>
              <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">Last {period}</p>
            </div>
            <span className="text-sm font-bold text-dark-900 dark:text-white">
              {data.period_orders} orders total
            </span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={data.daily_orders} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tickFormatter={v => v.slice(5)} // show MM-DD
              />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="orders" name="orders" fill="#f97316" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Recent orders table ── */}
      <div className="card dark:bg-dark-800 dark:border-dark-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-900 dark:text-white">Recent Orders</h3>
          <a href="/admin/orders" className="text-sm text-primary-600 hover:underline font-medium">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-dark-200 dark:border-dark-700">
                {['Reference', 'Customer', 'Date', 'Status', 'Total'].map(h => (
                  <th key={h} className="pb-3 font-semibold text-dark-500 dark:text-dark-400 text-xs uppercase tracking-wide pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
              {isLoading && Array(6).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="py-3 pr-4">
                    <div className="skeleton h-5 rounded w-full" />
                  </td>
                </tr>
              ))}
              {!isLoading && recentOrders.map(o => (
                <tr key={o.id} className="hover:bg-dark-50 dark:hover:bg-dark-700/40 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-primary-600 dark:text-primary-400 font-bold">
                    #{o.reference}
                  </td>
                  <td className="py-3 pr-4 text-dark-800 dark:text-dark-200 font-medium">
                    {o.user?.name ?? '—'}
                  </td>
                  <td className="py-3 pr-4 text-dark-500 dark:text-dark-400 text-xs whitespace-nowrap">
                    {new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={clsx('badge text-xs capitalize', STATUS_COLORS[o.status] ?? 'badge-secondary')}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-dark-900 dark:text-white">
                    €{Number(o.total).toFixed(2)}
                  </td>
                </tr>
              ))}
              {!isLoading && recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-dark-400 dark:text-dark-500">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
