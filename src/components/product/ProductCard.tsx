import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  final_price: number;
  discount_percentage?: number;
  average_rating: number;
  reviews_count: number;
  stock: number;
  image?: string;
  brand?: string;
  is_featured?: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { addItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    addItem(product.id, 1);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      toast.error('Please sign in to use wishlist');
      return;
    }
    try {
      await api.post('/wishlist', { product_id: product.id });
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {}
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className={clsx(
        'group relative flex flex-col bg-white rounded-xl border border-dark-200 overflow-hidden',
        'hover:border-primary-300 hover:shadow-lg transition-all duration-300',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-dark-50 overflow-hidden">
        {!imgError && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-dark-300">
            <Eye size={40} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="badge bg-primary-600 text-white text-xs font-bold px-2 py-1">
              -{product.discount_percentage}%
            </span>
          )}
          {product.is_featured && (
            <span className="badge bg-amber-500 text-white text-xs font-bold px-2 py-1">
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-dark-700 text-white text-xs px-2 py-1">
              Out of stock
            </span>
          )}
        </div>

        {/* Actions overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlist}
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors',
              isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-dark-600 hover:bg-red-50 hover:text-red-500'
            )}
          >
            <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Add to cart overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isLoading}
            className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary-700 disabled:bg-dark-400 transition-colors"
          >
            <ShoppingCart size={16} />
            {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 p-3 flex flex-col gap-1.5">
        {product.brand && (
          <span className="text-xs text-dark-500 font-medium uppercase tracking-wide">{product.brand}</span>
        )}
        <h3 className="text-sm font-medium text-dark-900 line-clamp-2 group-hover:text-primary-700 transition-colors leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        {product.reviews_count > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={11}
                  className={star <= Math.round(product.average_rating) ? 'text-amber-400 fill-amber-400' : 'text-dark-200 fill-dark-200'}
                />
              ))}
            </div>
            <span className="text-xs text-dark-500">({product.reviews_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className={clsx('font-bold text-base', hasDiscount ? 'text-primary-600' : 'text-dark-900')}>
            €{product.final_price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-dark-400 line-through text-sm">
              €{product.price}
            </span>
          )}
        </div>

        {/* Stock warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="text-xs text-orange-600 font-medium">
            Only {product.stock} left!
          </span>
        )}
      </div>
    </Link>
  );
}
