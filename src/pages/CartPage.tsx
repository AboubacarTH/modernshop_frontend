import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

export default function CartPage() {
  const { items, subtotal, updateItem, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();
  const shipping = subtotal >= 50 ? 0 : 4.99;

  if (items.length === 0) return (
    <div className="container-page py-20 flex flex-col items-center text-center max-w-md mx-auto">
      <div className="w-24 h-24 bg-dark-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingCart size={40} className="text-dark-400" />
      </div>
      <h1 className="text-2xl font-display font-bold text-dark-900 mb-2">Your cart is empty</h1>
      <p className="text-dark-500 mb-8">Add some products and come back here to checkout.</p>
      <Link to="/products" className="btn-primary btn-lg">
        <ShoppingBag size={18} /> Start Shopping
      </Link>
    </div>
  );

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-dark-900 flex items-center gap-2">
          <ShoppingCart size={22} className="text-primary-600" /> Shopping Cart
          <span className="text-lg font-normal text-dark-500">({items.length} items)</span>
        </h1>
        <button onClick={clearCart} className="btn-ghost text-sm text-red-500 hover:bg-red-50">
          <Trash2 size={14} /> Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-5 flex gap-5">
              <Link to={`/products/${item.product.slug}`} className="w-24 h-24 rounded-xl overflow-hidden bg-dark-100 flex-shrink-0 hover:opacity-90 transition-opacity">
                {item.product.image
                  ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-dark-300"><ShoppingCart size={24} /></div>
                }
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product.slug}`} className="font-semibold text-dark-900 hover:text-primary-600 transition-colors text-sm leading-snug line-clamp-2">
                  {item.product.name}
                </Link>
                {item.product.brand && <p className="text-xs text-dark-500 mt-0.5">{item.product.brand}</p>}
                {item.variant && <p className="text-xs text-dark-400 mt-0.5">{item.variant}</p>}

                <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                  {/* Qty */}
                  <div className="flex items-center border border-dark-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-dark-100 transition-colors"
                    >
                      {item.quantity === 1 ? <Trash2 size={14} className="text-red-400" /> : <Minus size={14} />}
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-9 h-9 flex items-center justify-center hover:bg-dark-100 transition-colors disabled:opacity-30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-bold text-dark-900">€{(item.product.final_price * item.quantity).toFixed(2)}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-dark-400">€{item.product.final_price.toFixed(2)} each</p>
                    )}
                  </div>
                </div>
              </div>

              <button onClick={() => removeItem(item.id)} className="self-start p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-dark-400 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-5 sticky top-24 space-y-4">
            <h2 className="font-display font-bold text-dark-900 text-lg">Order Summary</h2>

            {/* Free shipping bar */}
            {subtotal < 50 && (
              <div>
                <p className="text-sm text-dark-600 mb-2">
                  Add <span className="font-semibold text-primary-600">€{(50 - subtotal).toFixed(2)}</span> more for free shipping
                </p>
                <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {subtotal >= 50 && (
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 p-3 rounded-lg">
                🎉 You qualify for free shipping!
              </div>
            )}

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm text-dark-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-dark-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : `€${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-dark-900 text-lg pt-2 border-t border-dark-200">
                <span>Total</span>
                <span>€{(subtotal + shipping).toFixed(2)}</span>
              </div>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn-primary w-full btn-lg">
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            <Link to="/products" className="btn-outline w-full text-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
