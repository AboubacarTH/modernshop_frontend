import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart2,
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import clsx from 'clsx';

const NAV = [
  { href: '/admin',            label: 'Analytics',  icon: LayoutDashboard, exact: true },
  { href: '/admin/products',   label: 'Products',   icon: Package },
  { href: '/admin/orders',     label: 'Orders',     icon: ShoppingBag },
  { href: '/admin/users',      label: 'Users',      icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  const Sidebar = () => (
    <aside className="w-64 bg-dark-950 text-white flex flex-col h-full">
      <div className="p-5 border-b border-dark-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm">ModernShop</p>
            <p className="text-dark-400 text-xs">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            to={href}
            onClick={() => setSidebarOpen(false)}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive(href, exact)
                ? 'bg-primary-600 text-white'
                : 'text-dark-400 hover:bg-dark-800 hover:text-white'
            )}
          >
            <Icon size={18} />
            {label}
            {isActive(href, exact) && <ChevronRight size={14} className="ml-auto" />}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-dark-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-dark-400 hover:text-red-400 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-dark-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full z-50 md:hidden flex">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-dark-200 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-dark-100 rounded-lg">
            <Menu size={20} />
          </button>
          <h1 className="font-display font-bold text-dark-900">
            {NAV.find(n => isActive(n.href, n.exact))?.label || 'Admin'}
          </h1>
          <Link to="/" className="ml-auto text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            ← View Store
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
