import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, ArrowLeft, MapPin, CreditCard, Truck, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const cancelOrder = useMutation({
    mutationFn: () => api.post(`/orders/${id}/cancel`),
    onSuccess: () => {
      toast.success('Order cancelled');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Cannot cancel order'),
  });

  if (isLoading) return (
    <div className="container-page py-8 space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="card p-6"><div className="skeleton h-4 w-full rounded" /></div>)}
    </div>
  );
  if (!order) return <div className="container-page py-20 text-center text-dark-500">Order not found</div>;

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const canCancel   = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="container-page py-8">
      <Link to="/orders" className="flex items-center gap-2 text-sm text-dark-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-900">Order #{order.reference}</h1>
          <p className="text-dark-500 text-sm mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {canCancel && (
          <button
            onClick={() => cancelOrder.mutate()}
            disabled={cancelOrder.isPending}
            className="btn-danger btn-sm"
          >
            {cancelOrder.isPending ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-dark-900 mb-6 flex items-center gap-2">
            <Truck size={18} className="text-primary-600" /> Order Progress
          </h2>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-2">
                  <div className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    i <= currentStep ? 'bg-primary-600 text-white' : 'bg-dark-100 text-dark-400'
                  )}>
                    {i <= currentStep ? '✓' : i + 1}
                  </div>
                  <span className={clsx(
                    'text-xs capitalize hidden sm:block',
                    i <= currentStep ? 'text-primary-600 font-medium' : 'text-dark-400'
                  )}>
                    {step}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={clsx(
                    'flex-1 h-1 mx-1 rounded-full transition-all',
                    i < currentStep ? 'bg-primary-600' : 'bg-dark-200'
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
          {order.tracking_number && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm text-blue-800">
              <Truck size={16} /> Tracking: <span className="font-mono font-bold">{order.tracking_number}</span>
              {order.carrier && <span className="text-blue-600">via {order.carrier}</span>}
            </div>
          )}
        </div>
      )}

      {isCancelled && (
        <div className="card p-4 mb-6 border-red-200 bg-red-50 flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <p className="font-medium">This order has been cancelled.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-semibold text-dark-900 mb-4 flex items-center gap-2">
            <Package size={18} className="text-primary-600" /> Items ({order.items?.length})
          </h2>
          <div className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-dark-100 last:border-0 last:pb-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-dark-100 flex-shrink-0">
                  {item.product?.images?.[0]?.url ? (
                    <img src={item.product.images[0].url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-300">
                      <Package size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark-900 text-sm line-clamp-2">{item.name}</p>
                  {item.variant && <p className="text-xs text-dark-500 mt-0.5">{item.variant}</p>}
                  <p className="text-xs text-dark-500 mt-1">Qty: {item.quantity} × €{Number(item.price).toFixed(2)}</p>
                </div>
                <p className="font-bold text-dark-900 flex-shrink-0">
                  €{(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          {/* Totals */}
          <div className="card p-5">
            <h2 className="font-semibold text-dark-900 mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-dark-600">
                <span>Subtotal</span><span>€{Number(order.subtotal).toFixed(2)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount{order.promo_code ? ` (${order.promo_code})` : ''}</span>
                  <span>-€{Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-dark-600">
                <span>Shipping</span>
                <span>{Number(order.shipping) === 0 ? 'Free' : `€${Number(order.shipping).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-dark-900 text-base pt-2 border-t border-dark-200">
                <span>Total</span><span>€{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h2 className="font-semibold text-dark-900 mb-3 flex items-center gap-2">
              <CreditCard size={16} className="text-primary-600" /> Payment
            </h2>
            <p className="text-sm text-dark-700 capitalize">{order.payment_method?.replace('_', ' ')}</p>
            <span className={clsx(
              'badge mt-2',
              order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'
            )}>
              {order.payment_status}
            </span>
          </div>

          {/* Delivery address */}
          {order.address && (
            <div className="card p-5">
              <h2 className="font-semibold text-dark-900 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-primary-600" /> Delivery Address
              </h2>
              <address className="text-sm text-dark-700 not-italic leading-relaxed">
                <span className="font-medium">{order.address.first_name} {order.address.last_name}</span><br />
                {order.address.address_line1}<br />
                {order.address.address_line2 && <>{order.address.address_line2}<br /></>}
                {order.address.postal_code} {order.address.city}<br />
                {order.address.country}
              </address>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
