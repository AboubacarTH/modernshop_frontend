import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Zap, Shield, Truck, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

const CATEGORIES = [
  { name: 'Smartphones',  slug: 'smartphones',  emoji: '📱', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Laptops',      slug: 'laptops',       emoji: '💻', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Audio',        slug: 'audio',         emoji: '🎧', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { name: 'Gaming',       slug: 'gaming',        emoji: '🎮', color: 'bg-green-50 text-green-700 border-green-200' },
  { name: 'Cameras',      slug: 'cameras',       emoji: '📷', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'Books',        slug: 'books',         emoji: '📚', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Music',        slug: 'music',         emoji: '🎵', color: 'bg-red-50 text-red-700 border-red-200' },
  { name: 'Movies',       slug: 'movies',        emoji: '🎬', color: 'bg-teal-50 text-teal-700 border-teal-200' },
];

const PERKS = [
  { icon: Truck,     title: 'Free Shipping',   desc: 'On orders over €50' },
  { icon: Shield,    title: 'Secure Payment',  desc: '100% protected' },
  { icon: RefreshCw, title: 'Easy Returns',    desc: '30-day returns' },
  { icon: Zap,       title: 'Fast Delivery',   desc: '2-3 business days' },
];

function getProductsFromResponse(response: unknown): any[] {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== 'object') return [];

  const { data, products } = response as { data?: unknown; products?: unknown };
  if (Array.isArray(data)) return data;
  if (Array.isArray(products)) return products;

  if (data && typeof data === 'object') {
    const nested = data as { data?: unknown; products?: unknown };
    if (Array.isArray(nested.data)) return nested.data;
    if (Array.isArray(nested.products)) return nested.products;
  }

  return [];
}

function ProductRow({ title, endpoint, link }: { title: string; endpoint: string; link: string }) {
  const { data, isLoading } = useQuery({
    queryKey: [endpoint],
    queryFn: () => api.get(`/products/${endpoint}`).then(r => r.data),
  });
  const products = getProductsFromResponse(data).slice(0, 6);

  return (
    <section className="py-10">
      <div className="container-page">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">{title}</h2>
          <Link to={link} className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {isLoading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="rounded-xl border border-dark-200 overflow-hidden">
                  <div className="skeleton aspect-square" />
                  <div className="p-3 space-y-2">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-3 w-full rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                  </div>
                </div>
              ))
            : products.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))
          }
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-700 rounded-full blur-3xl" />
        </div>
        <div className="container-page relative py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary-600/20 border border-primary-500/30 text-primary-400 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
              <Zap size={14} className="fill-primary-400" />
              New Season Deals — Up to 40% off
            </div>
            <h1 className="text-4xl lg:text-6xl font-display font-bold leading-tight mb-6">
              Tech & Entertainment<br />
              <span className="text-primary-400">All in one place</span>
            </h1>
            <p className="text-dark-300 text-lg mb-8 max-w-lg mx-auto lg:mx-0">
              Discover thousands of products from top brands. Electronics, books, music, gaming — curated for you.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link to="/products" className="btn-primary btn-lg text-base">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/products?sort=price_asc" className="btn border border-white/20 text-white hover:bg-white/10 btn-lg text-base">
                View Deals
              </Link>
            </div>
          </div>
          <div className="flex-1 relative hidden lg:block">
            <div className="w-full h-80 bg-gradient-to-br from-primary-500/20 to-dark-800/50 rounded-3xl flex items-center justify-center border border-primary-500/20">
              <span className="text-8xl">🛍️</span>
            </div>
          </div>
        </div>
      </section>

      {/* Perks bar */}
      <section className="border-b border-dark-200 bg-dark-50">
        <div className="container-page py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-dark-900 text-sm">{title}</p>
                  <p className="text-dark-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10">
        <div className="container-page">
          <h2 className="section-title mb-6">Browse Categories</h2>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/categories/${cat.slug}`}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${cat.color} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-semibold text-center leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo banner */}
      <section className="py-4">
        <div className="container-page">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 text-white p-8 flex items-center justify-between">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute right-20 -bottom-8 w-24 h-24 bg-white/10 rounded-full" />
            <div className="relative">
              <p className="text-primary-200 text-sm font-medium mb-1">Limited Time Offer</p>
              <h3 className="text-2xl font-display font-bold mb-2">Up to 30% off Audio</h3>
              <p className="text-primary-100 text-sm mb-4">Sony, Bose, Apple — premium sound at unbeatable prices</p>
              <Link to="/categories/audio" className="btn bg-white text-primary-700 hover:bg-primary-50 font-semibold">
                Shop Audio <ArrowRight size={16} />
              </Link>
            </div>
            <div className="hidden md:block text-8xl relative">🎧</div>
          </div>
        </div>
      </section>

      {/* Product rows */}
      <ProductRow title="Featured Products"  endpoint="featured"    link="/products?featured=1" />
      <ProductRow title="New Arrivals"       endpoint="new-arrivals" link="/products?sort=newest" />
      <ProductRow title="Bestsellers"        endpoint="bestsellers"  link="/products?sort=bestselling" />

      {/* Second promo */}
      <section className="py-4 pb-10">
        <div className="container-page">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-dark-900 to-dark-700 text-white p-7 flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm mb-1">New Arrivals</p>
                <h3 className="text-xl font-display font-bold mb-3">Latest Smartphones</h3>
                <Link to="/categories/smartphones" className="btn bg-white text-dark-900 hover:bg-dark-100 text-sm">
                  Explore <ArrowRight size={14} />
                </Link>
              </div>
              <span className="text-6xl">📱</span>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white p-7 flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Pro Picks</p>
                <h3 className="text-xl font-display font-bold mb-3">Gaming Essentials</h3>
                <Link to="/categories/gaming" className="btn bg-white text-blue-900 hover:bg-blue-50 text-sm">
                  Shop Gaming <ArrowRight size={14} />
                </Link>
              </div>
              <span className="text-6xl">🎮</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
