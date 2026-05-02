import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import clsx from 'clsx';

export default function CartDrawer() {
  const { items, subtotal, isOpen, closeDrawer, updateItem, removeItem } = useCartStore();
  const navigate = useNavigate();

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className={clsx(
          'fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-200">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary-600" />
            <h2 className="text-lg font-display font-bold text-dark-900">
              Shopping Cart
              {items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-dark-500">({items.length} items)</span>
              )}
            </h2>
          </div>
          <button onClick={closeDrawer} className="p-2 hover:bg-dark-100 rounded-lg transition-colors">
            <X size={20} className="text-dark-600" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <div className="w-20 h-20 bg-dark-100 rounded-full flex items-center justify-center">
                <ShoppingBag size={32} className="text-dark-400" />
              </div>
              <div>
                <p className="font-semibold text-dark-900 mb-1">Your cart is empty</p>
                <p className="text-sm text-dark-500">Add some products to get started</p>
              </div>
              <button onClick={closeDrawer} className="btn-primary mt-2">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-dark-200 hover:border-dark-300 transition-colors">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-dark-100 flex-shrink-0">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-300">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 line-clamp-2 leading-tight">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-xs text-dark-500 mt-0.5">{item.variant}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      {/* Qty control */}
                      <div className="flex items-center gap-1 border border-dark-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-dark-100 transition-colors"
                        >
                          {item.quantity === 1 ? <Trash2 size={12} className="text-red-500" /> : <Minus size={12} />}
                        </button>
                        <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-7 h-7 flex items-center justify-center hover:bg-dark-100 transition-colors disabled:opacity-40"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="font-bold text-dark-900 text-sm">
                        €{(item.product.final_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-dark-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-dark-200 p-5 space-y-4 bg-dark-50">
            {/* Free shipping threshold */}
            {subtotal < 50 && (
              <div>
                <div className="flex justify-between text-xs text-dark-600 mb-1.5">
                  <span>Add €{(50 - subtotal).toFixed(2)} more for free shipping</span>
                  <span>{Math.round((subtotal / 50) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-dark-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {subtotal >= 50 && (
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                ✓ You qualify for free shipping!
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-dark-600">
                <span>Subtotal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-dark-600">
                <span>Shipping</span>
                <span>{subtotal >= 50 ? <span className="text-green-600 font-medium">Free</span> : '€4.99'}</span>
              </div>
              <div className="flex justify-between font-bold text-dark-900 text-base pt-2 border-t border-dark-200">
                <span>Total</span>
                <span>€{(subtotal + (subtotal >= 50 ? 0 : 4.99)).toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => { closeDrawer(); navigate('/checkout'); }}
                className="btn-primary w-full btn-lg"
              >
                Checkout <ArrowRight size={16} />
              </button>
              <button
                onClick={() => { closeDrawer(); navigate('/cart'); }}
                className="btn-outline w-full"
              >
                View Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
