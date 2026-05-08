import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import { useThemeStore, applyTheme } from '@/stores/themeStore';
import { useRealtimeCart } from '@/hooks/useRealtimeCart';

const MainLayout = lazy(() => import('@/layouts/MainLayout'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));

const HomePage = lazy(() => import('@/pages/HomePage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

function CartSync() { useRealtimeCart(); return null; }

function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="h-10 w-10 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
    </div>
  );
}

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
        <Suspense fallback={<RouteLoader />}>
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
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px' }, success: { iconTheme: { primary: '#f97316', secondary: '#fff' } } }} />
    </QueryClientProvider>
  );
}
