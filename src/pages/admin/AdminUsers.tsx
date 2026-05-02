import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import api from '@/lib/api';
import clsx from 'clsx';

export default function AdminUsers() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => api.get('/admin/users', { params: { page } }).then(r => r.data),
  });

  const users = data?.data || [];

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-display font-bold text-dark-900">Users</h2>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-200">
              <tr className="text-left">
                {['Name','Email','Role','Joined','Orders'].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold text-dark-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {isLoading && [1,2,3].map(i => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>)}
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-dark-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-sm font-bold">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-dark-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dark-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('badge', u.role === 'admin' ? 'badge-danger' : 'badge-secondary')}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-dark-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-dark-700">{u.orders_count ?? 0}</td>
                </tr>
              ))}
              {!isLoading && users.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-dark-400">No users yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
