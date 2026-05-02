import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, X, ChevronDown, LogOut, Package, Settings, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import ThemeToggle from '@/components/ui/ThemeToggle';
import clsx from 'clsx';

const NAV_LINKS = [
  { label: 'Electronics',  href: '/categories/electronics' },
  { label: 'Smartphones',  href: '/categories/smartphones' },
  { label: 'Laptops',      href: '/categories/laptops' },
  { label: 'Audio',        href: '/categories/audio' },
  { label: 'Gaming',       href: '/categories/gaming' },
  { label: 'Books',        href: '/categories/books' },
  { label: 'Music',        href: '/categories/music' },
  { label: 'Deals 🔥',     href: '/products?sort=price_asc', className: 'text-primary-600 font-semibold' },
];

export default function Header() {
  const location  = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { itemsCount, toggleDrawer } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const h = (e: MouseEvent) => { if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-dark-950 border-b border-dark-200 dark:border-dark-800 shadow-sm transition-colors">
      {/* Top bar */}
      <div className="bg-dark-950 dark:bg-black text-white text-xs py-1.5">
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
            <span className="text-xl font-display font-bold text-dark-900 dark:text-white hidden sm:block">
              Modern<span className="text-primary-600">Shop</span>
            </span>
          </Link>

          {/* Advanced Search */}
          <AdvancedSearch className="flex-1 max-w-2xl hidden sm:block" />

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto sm:ml-0">
            <ThemeToggle className="hidden md:flex" />

            {isAuthenticated() && (
              <Link to="/wishlist" className="p-2.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors">
                <Heart size={20} className="text-dark-600 dark:text-dark-300" />
              </Link>
            )}

            <button onClick={toggleDrawer} className="p-2.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors relative">
              <ShoppingCart size={20} className="text-dark-600 dark:text-dark-300" />
              {itemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {itemsCount > 99 ? '99+' : itemsCount}
                </span>
              )}
            </button>

            {/* User dropdown */}
            <div className="relative" ref={userRef}>
              <button onClick={() => setUserOpen(!userOpen)} className="flex items-center gap-2 p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center">
                  {user ? <span className="text-primary-700 dark:text-primary-400 font-semibold text-sm">{user.name[0].toUpperCase()}</span>
                        : <User size={16} className="text-dark-500 dark:text-dark-400" />}
                </div>
                <span className="hidden md:block text-sm font-medium text-dark-700 dark:text-dark-200 max-w-24 truncate">
                  {user ? user.name.split(' ')[0] : 'Account'}
                </span>
                <ChevronDown size={14} className={clsx('text-dark-500 dark:text-dark-400 transition-transform', userOpen && 'rotate-180')} />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 shadow-xl z-50 animate-slide-down overflow-hidden">
                  {isAuthenticated() ? (
                    <>
                      <div className="px-4 py-3 border-b border-dark-100 dark:border-dark-700">
                        <p className="font-semibold text-dark-900 dark:text-white text-sm">{user?.name}</p>
                        <p className="text-dark-500 dark:text-dark-400 text-xs mt-0.5 truncate">{user?.email}</p>
                      </div>
                      {isAdmin() && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 dark:hover:bg-dark-700 text-sm text-dark-700 dark:text-dark-300" onClick={() => setUserOpen(false)}>
                          <LayoutDashboard size={16} /> Admin Dashboard
                        </Link>
                      )}
                      <Link to="/orders"  className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 dark:hover:bg-dark-700 text-sm text-dark-700 dark:text-dark-300" onClick={() => setUserOpen(false)}><Package size={16} /> My Orders</Link>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 dark:hover:bg-dark-700 text-sm text-dark-700 dark:text-dark-300" onClick={() => setUserOpen(false)}><Settings size={16} /> Profile</Link>
                      <div className="border-t border-dark-100 dark:border-dark-700">
                        <button onClick={() => { logout(); setUserOpen(false); navigate('/'); }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400 w-full">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link to="/login"    className="flex items-center gap-3 px-4 py-3 hover:bg-dark-50 dark:hover:bg-dark-700 text-sm font-medium text-dark-900 dark:text-white" onClick={() => setUserOpen(false)}><User size={16} /> Sign In</Link>
                      <div className="px-4 pb-3">
                        <Link to="/register" className="btn-primary w-full text-center block" onClick={() => setUserOpen(false)}>Create Account</Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors">
              {mobileOpen ? <X size={20} className="text-dark-700 dark:text-dark-200" /> : <Menu size={20} className="text-dark-700 dark:text-dark-200" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mt-3 sm:hidden">
          <AdvancedSearch />
        </div>
      </div>

      {/* Category nav */}
      <nav className="border-t border-dark-100 dark:border-dark-800 bg-white dark:bg-dark-950 hidden md:block">
        <div className="container-page">
          <ul className="flex items-center gap-0.5 overflow-x-auto">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={clsx(
                    'block px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-sm',
                    link.className || 'text-dark-700 dark:text-dark-300',
                    location.pathname === link.href && 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
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
        <div className="md:hidden border-t border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-950 animate-slide-down">
          <div className="container-page py-3 flex items-center justify-between border-b border-dark-100 dark:border-dark-800 pb-3 mb-1">
            <span className="text-sm font-medium text-dark-600 dark:text-dark-400">Theme</span>
            <ThemeToggle />
          </div>
          <nav className="container-page py-2">
            {NAV_LINKS.map(link => (
              <Link key={link.href} to={link.href} className="block py-2.5 px-2 text-sm font-medium text-dark-700 dark:text-dark-300 hover:text-primary-600 border-b border-dark-100 dark:border-dark-800 last:border-0">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
