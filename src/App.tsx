import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import { useThemeStore, applyTheme } from '@/stores/themeStore';
import { useRealtimeCart } from '@/hooks/useRealtimeCart';

import MainLayout  from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';

import HomePage          from '@/pages/HomePage';
import ProductsPage      from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CategoryPage      from '@/pages/CategoryPage';
import SearchPage        from '@/pages/SearchPage';
import CartPage          from '@/pages/CartPage';
import CheckoutPage      from '@/pages/CheckoutPage';
import OrderSuccessPage  from '@/pages/OrderSuccessPage';
import OrdersPage        from '@/pages/OrdersPage';
import OrderDetailPage   from '@/pages/OrderDetailPage';
import WishlistPage      from '@/pages/WishlistPage';
import ProfilePage       from '@/pages/ProfilePage';
import LoginPage         from '@/pages/LoginPage';
import RegisterPage      from '@/pages/RegisterPage';
import NotFoundPage      from '@/pages/NotFoundPage';

import AdminAnalytics  from '@/pages/admin/AdminAnalytics';
import AdminProducts   from '@/pages/admin/AdminProducts';
import AdminOrders     from '@/pages/admin/AdminOrders';
import AdminUsers      from '@/pages/admin/AdminUsers';
import AdminCategories from '@/pages/admin/AdminCategories';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

function CartSync() { useRealtimeCart(); return null; }

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!isAdmin())         return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { token, fetchMe } = useAuthStore();
  const { isDark } = useThemeStore();

  useEffect(() => { applyTheme(isDark); }, [isDark]);
  useEffect(() => { if (token) fetchMe(); }, [token]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartSync />
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products"           element={<ProductsPage />} />
            <Route path="products/:slug"     element={<ProductDetailPage />} />
            <Route path="categories/:slug"   element={<CategoryPage />} />
            <Route path="search"             element={<SearchPage />} />
            <Route path="cart"               element={<CartPage />} />
            <Route path="wishlist"           element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
            <Route path="checkout"           element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
            <Route path="order-success/:id"  element={<PrivateRoute><OrderSuccessPage /></PrivateRoute>} />
            <Route path="orders"             element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
            <Route path="orders/:id"         element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
            <Route path="profile"            element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="login"              element={<LoginPage />} />
            <Route path="register"           element={<RegisterPage />} />
            <Route path="*"                  element={<NotFoundPage />} />
          </Route>
          <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index             element={<AdminAnalytics />} />
            <Route path="products"   element={<AdminProducts />} />
            <Route path="orders"     element={<AdminOrders />} />
            <Route path="users"      element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px' }, success: { iconTheme: { primary: '#f97316', secondary: '#fff' } } }} />
    </QueryClientProvider>
  );
}
