import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const { addItem } = useCartStore();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/wishlist').then(r => r.data),
  });

  const toggle = useMutation({
    mutationFn: (productId: number) => api.post('/wishlist', { product_id: productId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['wishlist'] }); toast.success('Removed from wishlist'); },
  });

  const items = wishlist?.data || [];

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-display font-bold text-dark-900 mb-6 flex items-center gap-2">
        <Heart size={22} className="text-primary-600" /> My Wishlist
      </h1>
      {isLoading && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="skeleton aspect-square rounded-xl" />)}</div>}
      {!isLoading && items.length === 0 && (
        <div className="text-center py-20">
          <Heart size={48} className="mx-auto text-dark-300 mb-4" />
          <h2 className="text-xl font-semibold text-dark-900 mb-2">Your wishlist is empty</h2>
          <p className="text-dark-500 mb-6">Save items you love for later.</p>
          <Link to="/products" className="btn-primary btn-lg">Browse Products</Link>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item: any) => (
          <div key={item.id} className="card overflow-hidden group">
            <Link to={`/products/${item.product?.slug}`} className="block aspect-square bg-dark-100 overflow-hidden">
              {item.product?.image && <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
            </Link>
            <div className="p-3">
              <Link to={`/products/${item.product?.slug}`} className="text-sm font-medium text-dark-900 hover:text-primary-600 line-clamp-2">{item.product?.name}</Link>
              <p className="font-bold text-dark-900 mt-1">€{Number(item.product?.final_price).toFixed(2)}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => addItem(item.product.id)} className="btn-primary flex-1 btn-sm"><ShoppingCart size={14} /></button>
                <button onClick={() => toggle.mutate(item.product.id)} className="btn-outline btn-sm"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
