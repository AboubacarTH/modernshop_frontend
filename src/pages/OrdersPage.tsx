import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import clsx from 'clsx';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-700',  icon: Clock },
  confirmed:  { label: 'Confirmed',  color: 'bg-blue-100 text-blue-700',    icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: RefreshCw },
  shipped:    { label: 'Shipped',    color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700',      icon: XCircle },
  refunded:   { label: 'Refunded',   color: 'bg-dark-100 text-dark-600',    icon: RefreshCw },
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then(r => r.data),
  });

  const orders = data?.data || [];

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-display font-bold text-dark-900 mb-6 flex items-center gap-2">
        <Package size={22} className="text-primary-600" /> My Orders
      </h1>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-5">
              <div className="skeleton h-4 w-1/4 rounded mb-3" />
              <div className="skeleton h-3 w-1/2 rounded mb-2" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto text-dark-300 mb-4" />
          <h2 className="text-xl font-semibold text-dark-900 mb-2">No orders yet</h2>
          <p className="text-dark-500 mb-6">Start shopping to see your orders here.</p>
          <Link to="/products" className="btn-primary btn-lg">Browse Products</Link>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order: any) => {
          const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const StatusIcon = statusCfg.icon;

          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="card p-5 flex items-center gap-5 hover:border-primary-300 hover:shadow-md transition-all group"
            >
              {/* Status icon */}
              <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', statusCfg.color)}>
                <StatusIcon size={22} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-semibold text-dark-900">#{order.reference}</p>
                  <span className={clsx('badge font-medium', statusCfg.color)}>
                    {statusCfg.label}
                  </span>
                </div>
                <p className="text-sm text-dark-500 mt-1">
                  {new Date(order.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {' · '}
                  {order.items_count || order.items?.length || 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                </p>
                {order.tracking_number && (
                  <p className="text-xs text-primary-600 mt-1">Tracking: {order.tracking_number}</p>
                )}
              </div>

              {/* Total + arrow */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="font-bold text-dark-900">€{Number(order.total).toFixed(2)}</p>
                  <p className="text-xs text-dark-500">{order.payment_method}</p>
                </div>
                <ChevronRight size={18} className="text-dark-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
