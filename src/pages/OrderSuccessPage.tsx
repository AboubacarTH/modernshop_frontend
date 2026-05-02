import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, ShoppingBag } from 'lucide-react';

export default function OrderSuccessPage() {
  const { id } = useParams();

  return (
    <div className="container-page py-20 flex flex-col items-center text-center max-w-lg mx-auto">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-fade-in">
        <CheckCircle size={48} className="text-green-500" />
      </div>

      <h1 className="text-3xl font-display font-bold text-dark-900 mb-3">Order Confirmed!</h1>
      <p className="text-dark-500 mb-2">
        Thank you for your purchase. Your order has been received and is being processed.
      </p>
      <p className="text-sm text-dark-400 mb-8">
        You'll receive an email confirmation shortly with tracking details.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link to={`/orders/${id}`} className="btn-primary btn-lg flex-1">
          <Package size={18} /> Track Order
        </Link>
        <Link to="/products" className="btn-outline btn-lg flex-1">
          <ShoppingBag size={18} /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}
