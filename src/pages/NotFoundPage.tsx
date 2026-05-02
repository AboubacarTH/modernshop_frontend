import React from 'react';
import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <div className="container-page py-24 text-center max-w-md mx-auto">
      <p className="text-8xl mb-6">🔍</p>
      <h1 className="text-4xl font-display font-bold text-dark-900 mb-3">Page Not Found</h1>
      <p className="text-dark-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary btn-lg">Go Home</Link>
    </div>
  );
}
