import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => api.get('/admin/products', { params: { page, search, per_page: 15 } }).then(r => r.data),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/products/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      api.put(`/admin/products/${id}`, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const products = data?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-display font-bold text-dark-900">Products</h2>
        <button className="btn-primary"><Plus size={16} /> Add Product</button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            className="input pl-9"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-200">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold text-dark-700">Product</th>
                <th className="px-4 py-3 font-semibold text-dark-700">Category</th>
                <th className="px-4 py-3 font-semibold text-dark-700">Price</th>
                <th className="px-4 py-3 font-semibold text-dark-700">Stock</th>
                <th className="px-4 py-3 font-semibold text-dark-700">Status</th>
                <th className="px-4 py-3 font-semibold text-dark-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {isLoading && [1,2,3,4,5].map(i => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>
              ))}
              {!isLoading && products.map((p: any) => (
                <tr key={p.id} className="hover:bg-dark-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-dark-100 overflow-hidden flex-shrink-0">
                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <Package size={16} className="m-auto mt-2.5 text-dark-300" />}
                      </div>
                      <div>
                        <p className="font-medium text-dark-900 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-dark-400">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dark-600">{p.category?.name}</td>
                  <td className="px-4 py-3 font-semibold text-dark-900">€{Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('font-medium', p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-amber-600' : 'text-green-600')}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive.mutate({ id: p.id, is_active: !p.is_active })}
                      className={clsx('badge cursor-pointer', p.is_active ? 'badge-success' : 'badge-secondary')}
                    >
                      {p.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-dark-400">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this product?')) deleteProduct.mutate(p.id); }}
                        className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-dark-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && products.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-dark-400">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.meta && data.meta.last_page > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-dark-200">
            {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={clsx('w-8 h-8 rounded-lg text-sm', p === page ? 'bg-primary-600 text-white' : 'bg-dark-100 text-dark-700 hover:bg-dark-200')}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
