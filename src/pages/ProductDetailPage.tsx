import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Star, Heart, ShoppingCart, Truck, Shield, RefreshCw,
  Minus, Plus, ChevronRight, Check
} from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import ProductCard from '@/components/product/ProductCard';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductReviews from '@/components/product/ProductReviews';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [qty, setQty]               = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab]   = useState<'description' | 'specs' | 'reviews'>('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { addItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const { data: product, isLoading: loading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then(r => r.data),
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ['related', slug],
    queryFn: () => api.get(`/products/${slug}/related`).then(r => r.data),
    enabled: !!slug,
  });

  const handleAddToCart = () => {
    if (!isAuthenticated()) { toast.error('Please sign in to add items to cart'); return; }
    addItem(product.id, qty);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated()) { toast.error('Please sign in to use wishlist'); return; }
    await api.post('/wishlist', { product_id: product.id });
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  if (loading) return (
    <div className="container-page py-8">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-6 w-1/3 rounded" />
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton h-12 w-1/3 rounded" />
          <div className="skeleton h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );

  if (!product) return <div className="container-page py-20 text-center text-dark-500">Product not found</div>;

  const hasDiscount = product.discount_percentage > 0;
  const images = product.images || [];
  const currentImage = images[selectedImage]?.url || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800`;

  return (
    <div className="bg-white">
      <div className="container-page py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-dark-500 mb-6">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight size={14} />
          <Link to="/products" className="hover:text-primary-600">Products</Link>
          {product.category && (
            <>
              <ChevronRight size={14} />
              <Link to={`/categories/${product.category.slug}`} className="hover:text-primary-600">{product.category.name}</Link>
            </>
          )}
          <ChevronRight size={14} />
          <span className="text-dark-900 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images — zoom & gallery */}
          <div>
            <ProductImageGallery images={product.images || []} productName={product.name} />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.brand && (
              <Link to={`/products?brand=${product.brand.slug}`} className="text-sm font-semibold text-primary-600 uppercase tracking-wide hover:text-primary-700">
                {product.brand.name}
              </Link>
            )}

            <h1 className="text-2xl lg:text-3xl font-display font-bold text-dark-900 mt-2 mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviews_count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16} className={s <= Math.round(product.average_rating) ? 'text-amber-400 fill-amber-400' : 'text-dark-200 fill-dark-200'} />
                  ))}
                </div>
                <span className="text-sm font-medium text-dark-900">{product.average_rating}</span>
                <button onClick={() => setActiveTab('reviews')} className="text-sm text-primary-600 hover:underline">
                  ({product.reviews_count} reviews)
                </button>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 p-4 bg-dark-50 rounded-xl">
              <span className={clsx('text-3xl font-bold', hasDiscount ? 'text-primary-600' : 'text-dark-900')}>
                €{product.final_price}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-dark-400 line-through">€{product.price}</span>
                  <span className="badge bg-primary-600 text-white font-bold text-sm px-2.5 py-1">
                    -{product.discount_percentage}%
                  </span>
                </>
              )}
            </div>

            {/* Short desc */}
            {product.short_description && (
              <p className="text-dark-600 text-sm mb-6 leading-relaxed">{product.short_description}</p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-4">
              {product.stock > 0 ? (
                <>
                  <Check size={16} className="text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    {product.stock <= 5 ? `Only ${product.stock} left in stock` : 'In stock'}
                  </span>
                </>
              ) : (
                <span className="text-sm text-red-600 font-medium">Out of stock</span>
              )}
            </div>

            {/* Qty + Add to cart */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border border-dark-300 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-dark-100 transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-semibold">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-11 h-11 flex items-center justify-center hover:bg-dark-100 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="btn-primary btn-lg flex-1"
                >
                  <ShoppingCart size={18} />
                  {isLoading ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleWishlist}
                  className={clsx(
                    'w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all',
                    isWishlisted ? 'border-red-400 bg-red-50 text-red-500' : 'border-dark-300 hover:border-red-400 hover:text-red-500 text-dark-500'
                  )}
                >
                  <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-dark-200">
              {[
                { icon: Truck,     label: 'Free shipping', sub: 'Over €50' },
                { icon: Shield,    label: '2-year warranty', sub: 'Guaranteed' },
                { icon: RefreshCw, label: 'Easy returns', sub: '30 days' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1 p-3 bg-dark-50 rounded-xl">
                  <Icon size={18} className="text-primary-600" />
                  <span className="text-xs font-semibold text-dark-800">{label}</span>
                  <span className="text-xs text-dark-500">{sub}</span>
                </div>
              ))}
            </div>

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-dark-400 mt-4">SKU: {product.sku}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex border-b border-dark-200 gap-8">
            {(['description', 'specs', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-dark-500 hover:text-dark-900'
                )}
              >
                {tab === 'reviews' ? `Reviews (${product.reviews_count})` : tab}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === 'description' && (
              <div
                className="prose prose-sm max-w-none text-dark-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }}
              />
            )}
            {activeTab === 'specs' && (
              <div className="grid sm:grid-cols-2 gap-2">
                {(product.attributes || []).map((attr: any) => (
                  <div key={attr.id} className="flex items-center gap-4 p-3 bg-dark-50 rounded-lg">
                    <span className="text-sm font-medium text-dark-600 w-32 flex-shrink-0">{attr.name}</span>
                    <span className="text-sm text-dark-900">{attr.value}</span>
                  </div>
                ))}
                {product.weight && (
                  <div className="flex items-center gap-4 p-3 bg-dark-50 rounded-lg">
                    <span className="text-sm font-medium text-dark-600 w-32">Weight</span>
                    <span className="text-sm text-dark-900">{product.weight} kg</span>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <ProductReviews
                productId={product.id}
                productSlug={product.slug}
                reviews={product.reviews || []}
                averageRating={product.average_rating}
                reviewsCount={product.reviews_count}
              />
            )}
          </div>
        </div>

        {/* Related products */}
        {related && related.length > 0 && (
          <section className="mt-12">
            <h2 className="section-title mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.slice(0, 4).map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
