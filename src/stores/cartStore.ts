import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export interface CartItem {
  id: number;
  quantity: number;
  variant?: string;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    final_price: number;
    discount?: number;
    stock: number;
    image?: string;
    brand?: string;
  };
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  itemsCount: number;
  isLoading: boolean;
  isOpen: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number, variant?: string) => Promise<void>;
  updateItem: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleDrawer: () => void;
  closeDrawer: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items:      [],
      subtotal:   0,
      itemsCount: 0,
      isLoading:  false,
      isOpen:     false,

      fetchCart: async () => {
        try {
          const { data } = await api.get('/cart');
          set({ items: data.items, subtotal: data.subtotal, itemsCount: data.items_count });
        } catch {}
      },

      addItem: async (productId, quantity = 1, variant) => {
        set({ isLoading: true });
        try {
          await api.post('/cart', { product_id: productId, quantity, variant });
          await get().fetchCart();
          set({ isOpen: true });
          toast.success('Added to cart!');
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Failed to add to cart');
        } finally {
          set({ isLoading: false });
        }
      },

      updateItem: async (id, quantity) => {
        try {
          await api.put(`/cart/${id}`, { quantity });
          await get().fetchCart();
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Failed to update cart');
        }
      },

      removeItem: async (id) => {
        try {
          await api.delete(`/cart/${id}`);
          await get().fetchCart();
          toast.success('Removed from cart');
        } catch {}
      },

      clearCart: async () => {
        try {
          await api.delete('/cart');
          set({ items: [], subtotal: 0, itemsCount: 0 });
        } catch {}
      },

      toggleDrawer: () => set((s) => ({ isOpen: !s.isOpen })),
      closeDrawer:  () => set({ isOpen: false }),
    }),
    {
      name:       'cart-storage',
      partialize: (state) => ({ items: state.items, subtotal: state.subtotal, itemsCount: state.itemsCount }),
    }
  )
);
