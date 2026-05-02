import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronDown,
  LogOut, Package, Settings, LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import clsx from 'clsx';

const NAV_LINKS = [
  { label: 'Electronics',  href: '/categories/electronics' },
  { label: 'Smartphones',  href: '/categories/smartphones' },
  { label: 'Laptops',      href: '/categories/laptops' },
  { label: 'Audio',        href: '/categories/audio' },
  { label: 'Gaming',       href: '/categories/gaming' },
  { label: 'Books',        href: '/categories/books' },
  { label: 'Music',        href: '/categories/music' },
  { label: 'Deals',        href: '/products?sort=price_asc', className: 'text-primary-600 font-semibold' },
];

export default function Header() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const [search, setSearch]   = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen]     = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { itemsCount, toggleDrawer } = useCartStore();

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-dark-200 shadow-sm">
      {/* Top bar */}
      <div className="bg-dark-950 text-white text-xs py-1.5">
        <div className="container-page flex items-center justify-between gap-4">
          <span>📦 Free shipping on orders over €50</span>
          <div className="flex items-center gap-4">
            <Link to="/orders" className="hover:text-primary-400 transition-colors">Track order</Link>
            <Link to="/profile" className="hover:text-primary-400 transition-colors">Help</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-page py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-display font-bold text-dark-900">
              Modern<span className="text-primary-600">Shop</span>
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden sm:flex">
            <div className="flex w-full rounded-xl border-2 border-dark-200 focus-within:border-primary-500 overflow-hidden transition-colors">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search products, brands..."
                className="flex-1 px-4 py-2.5 text-sm text-dark-900 outline-none bg-white"
              />
              <button
                type="submit"
                className="px-4 bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Wishlist */}
            {isAuthenticated() && (
              <Link to="/wishlist" className="p-2.5 hover:bg-dark-100 rounded-lg transition-colors relative">
                <Heart size={20} className="text-dark-600" />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={toggleDrawer}
              className="p-2.5 hover:bg-dark-100 rounded-lg transition-colors relative"
            >
              <ShoppingCart size={20} className="text-dark-600" />
              {itemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {itemsCount > 99 ? '99+' : itemsCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-2 p-2 hover:bg-dark-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  {user ? (
                    <span className="text-primary-700 font-semibold text-sm">{user.name[0].toUpperCase()}</span>
                  ) : (
                    <User size={16} className="text-dark-500" />
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium text-dark-700 max-w-24 truncate">
                  {user ? user.name.split(' ')[0] : 'Account'}
                </span>
                <ChevronDown size={14} className={clsx('text-dark-500 transition-transform', userOpen && 'rotate-180')} />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-dark-200 shadow-xl z-50 animate-slide-down overflow-hidden">
                  {isAuthenticated() ? (
                    <>
                      <div className="px-4 py-3 border-b border-dark-100">
                        <p className="font-semibold text-dark-900 text-sm">{user?.name}</p>
                        <p className="text-dark-500 text-xs mt-0.5 truncate">{user?.email}</p>
                      </div>
                      {isAdmin() && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 transition-colors text-sm text-dark-700" onClick={() => setUserOpen(false)}>
                          <LayoutDashboard size={16} /> Admin Dashboard
                        </Link>
                      )}
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 transition-colors text-sm text-dark-700" onClick={() => setUserOpen(false)}>
                        <Package size={16} /> My Orders
                      </Link>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 transition-colors text-sm text-dark-700" onClick={() => setUserOpen(false)}>
                        <Settings size={16} /> Profile
                      </Link>
                      <div className="border-t border-dark-100">
                        <button
                          onClick={() => { logout(); setUserOpen(false); navigate('/'); }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-sm text-red-600 w-full"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="flex items-center gap-3 px-4 py-3 hover:bg-dark-50 transition-colors text-sm font-medium text-dark-900" onClick={() => setUserOpen(false)}>
                        <User size={16} /> Sign In
                      </Link>
                      <div className="px-4 pb-3">
                        <Link to="/register" className="btn-primary w-full text-center block" onClick={() => setUserOpen(false)}>
                          Create Account
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 hover:bg-dark-100 rounded-lg transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="mt-3 sm:hidden">
          <div className="flex rounded-xl border-2 border-dark-200 focus-within:border-primary-500 overflow-hidden transition-colors">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search products..."
              className="flex-1 px-4 py-2.5 text-sm outline-none bg-white"
            />
            <button type="submit" className="px-4 bg-primary-600 text-white">
              <Search size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Category nav */}
      <nav className="border-t border-dark-100 bg-white hidden md:block">
        <div className="container-page">
          <ul className="flex items-center gap-0.5 overflow-x-auto">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={clsx(
                    'block px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap hover:text-primary-600 hover:bg-primary-50 rounded-sm',
                    link.className || 'text-dark-700',
                    location.pathname === link.href && 'text-primary-600 bg-primary-50'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-dark-200 bg-white animate-slide-down">
          <nav className="container-page py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block py-2.5 px-2 text-sm font-medium text-dark-700 hover:text-primary-600 border-b border-dark-100 last:border-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
