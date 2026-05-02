import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: cat } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => api.get(`/categories/${slug}`).then(r => r.data),
    enabled: !!slug,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['category-products', slug],
    queryFn: () => api.get(`/categories/${slug}/products`).then(r => r.data),
    enabled: !!slug,
  });

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-display font-bold text-dark-900 mb-2">{cat?.name || slug}</h1>
      {cat?.description && <p className="text-dark-500 mb-6">{cat.description}</p>}
      {!cat?.description && <div className="mb-6" />}
      {isLoading && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton aspect-square rounded-xl" />)}</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(data?.data || []).map((p: any) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
