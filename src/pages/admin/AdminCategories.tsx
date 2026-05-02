import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/admin/categories').then(r => r.data),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Category deleted'); },
  });

  const categories = data?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-dark-900">Categories</h2>
        <button className="btn-primary"><Plus size={16} /> Add Category</button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-200">
              <tr className="text-left">
                {['Name','Slug','Parent','Products','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold text-dark-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {isLoading && [1,2,3].map(i => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>)}
              {categories.map((c: any) => (
                <tr key={c.id} className="hover:bg-dark-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag size={15} className="text-primary-500" />
                      <span className="font-medium text-dark-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-dark-500">{c.slug}</td>
                  <td className="px-4 py-3 text-dark-500">{c.parent?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-dark-700">{c.products_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-dark-400"><Pencil size={14} /></button>
                      <button onClick={() => { if(confirm('Delete?')) deleteCategory.mutate(c.id); }} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-dark-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && categories.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-dark-400">No categories</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
