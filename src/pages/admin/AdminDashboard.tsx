import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ShoppingBag, Users, Package, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import clsx from 'clsx';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data),
  });

  const stats = [
    { label: 'Total Revenue',  value: data ? `€${Number(data.total_revenue || 0).toLocaleString()}` : '—', icon: TrendingUp, color: 'bg-green-50 text-green-600',  change: '+12%' },
    { label: 'Total Orders',   value: data?.total_orders   ?? '—', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600',   change: '+8%'  },
    { label: 'Total Products', value: data?.total_products ?? '—', icon: Package,     color: 'bg-purple-50 text-purple-600', change: '+3%'  },
    { label: 'Total Users',    value: data?.total_users    ?? '—', icon: Users,       color: 'bg-amber-50 text-amber-600',  change: '+15%' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-dark-900">Overview</h2>
        <p className="text-dark-500 text-sm mt-0.5">Welcome to your store dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
                <Icon size={20} />
              </div>
              <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
                <ArrowUpRight size={12} />{change}
              </span>
            </div>
            <p className="text-2xl font-bold text-dark-900 mt-3">
              {isLoading ? <span className="skeleton h-7 w-20 rounded block" /> : value}
            </p>
            <p className="text-dark-500 text-sm mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-900">Recent Orders</h3>
          <Link to="/admin/orders" className="text-sm text-primary-600 hover:underline">View all</Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-dark-500 border-b border-dark-200">
                  <th className="pb-3 font-medium">Reference</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {(data?.recent_orders || []).map((order: any) => (
                  <tr key={order.id} className="hover:bg-dark-50 transition-colors">
                    <td className="py-3">
                      <Link to={`/admin/orders`} className="font-mono text-primary-600 hover:underline text-xs">
                        #{order.reference}
                      </Link>
                    </td>
                    <td className="py-3 text-dark-700">{order.user?.name}</td>
                    <td className="py-3">
                      <span className={clsx('badge text-xs', {
                        'badge-warning': order.status === 'pending',
                        'badge-success': order.status === 'delivered',
                        'badge-danger':  order.status === 'cancelled',
                        'badge-secondary': !['pending','delivered','cancelled'].includes(order.status),
                      })}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-dark-900">€{Number(order.total).toFixed(2)}</td>
                  </tr>
                ))}
                {(!data?.recent_orders || data.recent_orders.length === 0) && (
                  <tr><td colSpan={4} className="py-8 text-center text-dark-400">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
