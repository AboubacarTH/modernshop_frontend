import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => api.get('/products/search', { params: { q } }).then(r => r.data),
    enabled: !!q,
  });

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-dark-900">Search Results</h1>
        <p className="text-dark-500 mt-1">{q ? `Showing results for "${q}"` : 'Enter a search term'}{data?.meta?.total !== undefined ? ` — ${data.meta.total} products` : ''}</p>
      </div>
      {isLoading && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton aspect-square rounded-xl" />)}</div>}
      {!isLoading && data?.data?.length === 0 && (
        <div className="text-center py-16">
          <Search size={48} className="mx-auto text-dark-300 mb-4" />
          <h2 className="text-xl font-semibold text-dark-900 mb-2">No results found</h2>
          <p className="text-dark-500">Try different keywords or browse our categories.</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(data?.data || []).map((p: any) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
