import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CreditCard, Truck, Tag, ChevronRight, Lock } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const PAYMENT_METHODS = [
  { id: 'card',          label: 'Credit / Debit Card',  icon: '💳' },
  { id: 'paypal',        label: 'PayPal',               icon: '🅿️' },
  { id: 'bank_transfer', label: 'Bank Transfer',        icon: '🏦' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCartStore();

  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod]     = useState('card');
  const [promoCode, setPromoCode]             = useState('');
  const [promoDiscount, setPromoDiscount]     = useState(0);
  const [promoApplied, setPromoApplied]       = useState('');
  const [notes, setNotes]                     = useState('');

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/user/addresses').then(r => r.data),
  });

  const [newAddress, setNewAddress] = useState({
    label: 'Home', first_name: '', last_name: '', phone: '',
    address_line1: '', city: '', postal_code: '', country: 'FR',
  });
  const [showNewAddr, setShowNewAddr] = useState(false);

  const validatePromo = async () => {
    try {
      const { data } = await api.post('/promo-codes/validate', { code: promoCode, subtotal });
      setPromoDiscount(data.discount);
      setPromoApplied(promoCode);
      toast.success(`Promo applied! You save €${data.discount.toFixed(2)}`);
    } catch {
      toast.error('Invalid or expired promo code');
    }
  };

  const saveAddress = async () => {
    try {
      const { data } = await api.post('/user/addresses', newAddress);
      setSelectedAddress(data.id);
      setShowNewAddr(false);
      toast.success('Address saved');
    } catch {
      toast.error('Failed to save address');
    }
  };

  const shipping = subtotal >= 50 ? 0 : 4.99;
  const total    = Math.max(0, subtotal - promoDiscount + shipping);

  const placeOrder = useMutation({
    mutationFn: () => api.post('/orders', {
      address_id:     selectedAddress,
      payment_method: paymentMethod,
      promo_code:     promoApplied || undefined,
      notes:          notes || undefined,
    }),
    onSuccess: (res) => {
      clearCart();
      navigate(`/order-success/${res.data.order_id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to place order');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    if (items.length === 0) { toast.error('Your cart is empty'); return; }
    placeOrder.mutate();
  };

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-display font-bold text-dark-900 mb-8 flex items-center gap-2">
        <Lock size={20} className="text-primary-600" /> Secure Checkout
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">

            {/* Address */}
            <div className="card p-5">
              <h2 className="font-display font-bold text-dark-900 mb-4 flex items-center gap-2">
                <Truck size={18} className="text-primary-600" /> Delivery Address
              </h2>

              {(addresses || []).length > 0 && (
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  {addresses.map((addr: any) => (
                    <label
                      key={addr.id}
                      className={clsx(
                        'border-2 rounded-xl p-4 cursor-pointer transition-all',
                        selectedAddress === addr.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-dark-200 hover:border-dark-400'
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="sr-only"
                      />
                      <p className="font-semibold text-dark-900 text-sm mb-1">{addr.label}</p>
                      <p className="text-dark-600 text-xs leading-relaxed">
                        {addr.first_name} {addr.last_name}<br />
                        {addr.address_line1}<br />
                        {addr.postal_code} {addr.city}, {addr.country}
                      </p>
                    </label>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowNewAddr(!showNewAddr)}
                className="btn-outline text-sm"
              >
                + Add new address
              </button>

              {showNewAddr && (
                <div className="mt-4 grid sm:grid-cols-2 gap-3 p-4 bg-dark-50 rounded-xl">
                  <div className="sm:col-span-2">
                    <label className="label">Label</label>
                    <input className="input" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} placeholder="Home, Work..." />
                  </div>
                  <div>
                    <label className="label">First Name</label>
                    <input className="input" required value={newAddress.first_name} onChange={e => setNewAddress({...newAddress, first_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input className="input" required value={newAddress.last_name} onChange={e => setNewAddress({...newAddress, last_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input className="input" required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Postal Code</label>
                    <input className="input" required value={newAddress.postal_code} onChange={e => setNewAddress({...newAddress, postal_code: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Address</label>
                    <input className="input" required value={newAddress.address_line1} onChange={e => setNewAddress({...newAddress, address_line1: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input className="input" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Country</label>
                    <input className="input" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <button type="button" onClick={saveAddress} className="btn-primary">Save Address</button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="card p-5">
              <h2 className="font-display font-bold text-dark-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-primary-600" /> Payment Method
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className={clsx(
                      'flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all',
                      paymentMethod === m.id ? 'border-primary-500 bg-primary-50' : 'border-dark-200 hover:border-dark-400'
                    )}
                  >
                    <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="sr-only" />
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-sm font-medium text-dark-800">{m.label}</span>
                  </label>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-4 grid sm:grid-cols-2 gap-3 p-4 bg-dark-50 rounded-xl">
                  <div className="sm:col-span-2">
                    <label className="label">Card Number</label>
                    <input className="input" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div>
                    <label className="label">Expiry Date</label>
                    <input className="input" placeholder="MM/YY" />
                  </div>
                  <div>
                    <label className="label">CVV</label>
                    <input className="input" placeholder="123" />
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="card p-5">
              <label className="label font-display font-bold text-dark-900 text-base">Order Notes (optional)</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Special instructions for your order..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="card p-5 sticky top-24 space-y-4">
              <h2 className="font-display font-bold text-dark-900 text-lg">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.product.image && (
                      <img src={item.product.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-dark-200 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-dark-900 line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-dark-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-dark-900 flex-shrink-0">
                      €{(item.product.final_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div className="pt-3 border-t border-dark-200">
                <label className="label text-sm flex items-center gap-1.5"><Tag size={14} /> Promo Code</label>
                <div className="flex gap-2">
                  <input
                    className="input flex-1 text-sm"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    disabled={!!promoApplied}
                  />
                  <button type="button" onClick={validatePromo} disabled={!promoCode || !!promoApplied} className="btn-outline text-sm px-3">
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-green-600 text-xs mt-1.5 font-medium">✓ {promoApplied} applied — save €{promoDiscount.toFixed(2)}</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-3 border-t border-dark-200">
                <div className="flex justify-between text-sm text-dark-600">
                  <span>Subtotal</span><span>€{subtotal.toFixed(2)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Discount</span><span>-€{promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-dark-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : `€${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-dark-900 text-lg pt-2 border-t border-dark-200">
                  <span>Total</span><span>€{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={placeOrder.isPending || items.length === 0}
                className="btn-primary w-full btn-lg"
              >
                {placeOrder.isPending ? 'Placing Order...' : `Place Order — €${total.toFixed(2)}`}
                <ChevronRight size={18} />
              </button>

              <p className="text-xs text-dark-500 text-center flex items-center justify-center gap-1">
                <Lock size={12} /> Your payment info is secure & encrypted
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
