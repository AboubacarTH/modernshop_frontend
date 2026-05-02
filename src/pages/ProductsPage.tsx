import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import clsx from 'clsx';

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Newest First' },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
  { value: 'rating',      label: 'Best Rated' },
  { value: 'bestselling', label: 'Best Selling' },
];

const PRICE_RANGES = [
  { label: 'Under €50',       min: 0,    max: 50 },
  { label: '€50 – €150',      min: 50,   max: 150 },
  { label: '€150 – €500',     min: 150,  max: 500 },
  { label: '€500 – €1,000',   min: 500,  max: 1000 },
  { label: 'Over €1,000',     min: 1000, max: 99999 },
];

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sort      = params.get('sort') || 'newest';
  const minPrice  = params.get('min_price');
  const maxPrice  = params.get('max_price');
  const inStock   = params.get('in_stock');
  const page      = Number(params.get('page') || 1);

  const { data, isLoading } = useQuery({
    queryKey: ['products', Object.fromEntries(params)],
    queryFn: () => api.get('/products', { params: Object.fromEntries(params) }).then(r => r.data),
  });

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const clearFilters = () => setParams({ sort });

  const hasFilters = minPrice || maxPrice || inStock;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Price range */}
      <div>
        <h3 className="font-semibold text-dark-900 mb-3 text-sm">Price Range</h3>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((r) => (
            <label key={r.label} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="price"
                checked={minPrice === String(r.min) && maxPrice === String(r.max)}
                onChange={() => {
                  updateParam('min_price', String(r.min));
                  updateParam('max_price', String(r.max));
                }}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-dark-700 group-hover:text-primary-600 transition-colors">{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* In stock */}
      <div>
        <h3 className="font-semibold text-dark-900 mb-3 text-sm">Availability</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock === '1'}
            onChange={(e) => updateParam('in_stock', e.target.checked ? '1' : null)}
            className="text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-dark-700">In Stock Only</span>
        </label>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-dark-900 mb-3 text-sm">Minimum Rating</h3>
        {[4, 3, 2].map((r) => (
          <label key={r} className="flex items-center gap-2 cursor-pointer mb-1.5">
            <input
              type="radio"
              name="rating"
              checked={params.get('rating') === String(r)}
              onChange={() => updateParam('rating', String(r))}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-dark-700">{'⭐'.repeat(r)} & above</span>
          </label>
        ))}
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:text-primary-700">
          <X size={14} /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-page py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <h2 className="font-display font-bold text-dark-900 mb-5 flex items-center gap-2">
              <SlidersHorizontal size={16} /> Filters
            </h2>
            <FilterPanel />
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-display font-bold text-dark-900">All Products</h1>
              {data && (
                <p className="text-sm text-dark-500 mt-0.5">{data.meta?.total?.toLocaleString()} products</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="md:hidden btn-outline"
              >
                <SlidersHorizontal size={16} /> Filters {hasFilters && <span className="badge-primary">!</span>}
              </button>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="input pr-8 pl-3 py-2 text-sm cursor-pointer appearance-none"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Mobile filters */}
          {filtersOpen && (
            <div className="md:hidden card p-4 mb-6">
              <FilterPanel />
            </div>
          )}

          {/* Active filters */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {minPrice && maxPrice && (
                <span className="badge-secondary flex items-center gap-1">
                  €{minPrice}–€{maxPrice}
                  <button onClick={() => { updateParam('min_price', null); updateParam('max_price', null); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {inStock && (
                <span className="badge-secondary flex items-center gap-1">
                  In Stock
                  <button onClick={() => updateParam('in_stock', null)}><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading
              ? Array(12).fill(0).map((_, i) => (
                  <div key={i} className="rounded-xl border border-dark-200 overflow-hidden">
                    <div className="skeleton aspect-square" />
                    <div className="p-3 space-y-2">
                      <div className="skeleton h-3 w-3/4 rounded" />
                      <div className="skeleton h-3 w-full rounded" />
                      <div className="skeleton h-4 w-1/2 rounded" />
                    </div>
                  </div>
                ))
              : (data?.data || []).map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))
            }
          </div>

          {/* No results */}
          {!isLoading && data?.data?.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <h3 className="font-semibold text-dark-900 mb-1">No products found</h3>
              <p className="text-dark-500 text-sm">Try adjusting your filters</p>
              <button onClick={clearFilters} className="btn-primary mt-4">Clear Filters</button>
            </div>
          )}

          {/* Pagination */}
          {data?.meta && data.meta.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => { const next = new URLSearchParams(params); next.set('page', String(p)); setParams(next); }}
                  className={clsx(
                    'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                    p === data.meta.current_page
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-dark-200 text-dark-700 hover:border-primary-400'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
