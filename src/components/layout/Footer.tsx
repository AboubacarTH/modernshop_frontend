import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const FOOTER_LINKS = {
  'Shop': [
    { label: 'Electronics',  href: '/categories/electronics' },
    { label: 'Smartphones',  href: '/categories/smartphones' },
    { label: 'Laptops',      href: '/categories/laptops' },
    { label: 'Audio',        href: '/categories/audio' },
    { label: 'Gaming',       href: '/categories/gaming' },
    { label: 'Books',        href: '/categories/books' },
  ],
  'Customer Service': [
    { label: 'Help Center',     href: '/help' },
    { label: 'Track My Order',  href: '/orders' },
    { label: 'Returns',         href: '/returns' },
    { label: 'Shipping Info',   href: '/shipping' },
    { label: 'Size Guide',      href: '/size-guide' },
    { label: 'Contact Us',      href: '/contact' },
  ],
  'About': [
    { label: 'About Us',        href: '/about' },
    { label: 'Careers',         href: '/careers' },
    { label: 'Press',           href: '/press' },
    { label: 'Sustainability',  href: '/sustainability' },
    { label: 'Investors',       href: '/investors' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-dark-950 text-dark-400 mt-auto">
      {/* Newsletter */}
      <div className="border-b border-dark-800">
        <div className="container-page py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-display font-bold text-lg mb-1">Stay up to date</h3>
              <p className="text-dark-400 text-sm">Get exclusive deals and the latest tech news.</p>
            </div>
            <form className="flex w-full max-w-md gap-2" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-dark-500 text-sm focus:outline-none focus:border-primary-500"
              />
              <button type="submit" className="btn-primary flex-shrink-0">
                <Mail size={16} /> Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="container-page py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-white font-display font-bold text-lg">
                Modern<span className="text-primary-500">Shop</span>
              </span>
            </div>
            <p className="text-dark-500 text-sm leading-relaxed mb-5">
              Your one-stop destination for tech, books, music, and entertainment. Quality products, great prices.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-dark-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{group}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link to={href} className="text-dark-500 hover:text-white text-sm transition-colors hover:translate-x-0.5 inline-block">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-800">
        <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-dark-600 text-xs">
            © {new Date().getFullYear()} ModernShop. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-dark-600 hover:text-white text-xs transition-colors">Privacy Policy</Link>
            <Link to="/terms"   className="text-dark-600 hover:text-white text-xs transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="text-dark-600 hover:text-white text-xs transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
