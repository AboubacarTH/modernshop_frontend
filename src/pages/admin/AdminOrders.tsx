import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => api.get('/admin/orders', { params: { page } }).then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.put(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Status updated'); },
  });

  const orders = data?.data || [];

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-display font-bold text-dark-900">Orders</h2>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-200">
              <tr className="text-left">
                {['Reference','Customer','Date','Items','Status','Total','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold text-dark-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {isLoading && [1,2,3].map(i => <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>)}
              {orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-dark-50">
                  <td className="px-4 py-3 font-mono text-xs text-primary-600">#{o.reference}</td>
                  <td className="px-4 py-3 text-dark-700">{o.user?.name}</td>
                  <td className="px-4 py-3 text-dark-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{o.items?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={e => updateStatus.mutate({ id: o.id, status: e.target.value })}
                      className="text-xs border border-dark-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 font-bold text-dark-900">€{Number(o.total).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('badge text-xs', o.payment_status === 'paid' ? 'badge-success' : 'badge-warning')}>
                      {o.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && orders.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-dark-400">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
