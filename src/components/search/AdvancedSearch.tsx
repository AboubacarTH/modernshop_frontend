import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import clsx from 'clsx';

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  image?: string;
  price: number;
  final_price: number;
  category?: { name: string };
  brand?: string;
}

const TRENDING = ['iPhone 15 Pro', 'Sony WH-1000XM5', 'MacBook Pro M3', 'Samsung Galaxy S24', 'AirPods Pro'];
const RECENT_KEY = 'recent_searches';

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
}

function saveRecent(q: string) {
  const prev = getRecent().filter(s => s !== q).slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev]));
}

export default function AdvancedSearch({ className }: { className?: string }) {
  const navigate  = useNavigate();
  const inputRef  = useRef<HTMLInputElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);

  const [query,    setQuery]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [results,  setResults]  = useState<SearchResult[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [recent,   setRecent]   = useState<string[]>([]);
  const [focused,  setFocused]  = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setRecent(getRecent());
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await api.get('/products/search', { params: { q, per_page: 6 } });
      setResults(data.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    setFocused(-1);
    clearTimeout(debounceRef.current);
    if (v.length >= 2) {
      setLoading(true);
      debounceRef.current = setTimeout(() => doSearch(v), 300);
    } else {
      setResults([]);
      setLoading(false);
    }
  };

  const handleSubmit = (q: string = query) => {
    if (!q.trim()) return;
    saveRecent(q.trim());
    setOpen(false);
    setQuery('');
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = results.length ? results.length : 0;
    if (e.key === 'ArrowDown')  { e.preventDefault(); setFocused(f => Math.min(f + 1, items - 1)); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setFocused(f => Math.max(f - 1, -1)); }
    if (e.key === 'Enter') {
      if (focused >= 0 && results[focused]) {
        navigate(`/products/${results[focused].slug}`);
        setOpen(false); setQuery('');
      } else {
        handleSubmit();
      }
    }
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  };

  const clearRecent = (term: string) => {
    const next = getRecent().filter(s => s !== term);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    setRecent(next);
  };

  const showDropdown = open && (query.length > 0 || recent.length > 0 || TRENDING.length > 0);

  return (
    <div ref={wrapRef} className={clsx('relative', className)}>
      {/* Input */}
      <div className={clsx(
        'flex items-center rounded-xl border-2 transition-all overflow-hidden bg-white dark:bg-dark-800',
        open
          ? 'border-primary-500 shadow-lg shadow-primary-100/50 dark:shadow-primary-900/20'
          : 'border-dark-200 dark:border-dark-600 hover:border-dark-300 dark:hover:border-dark-500'
      )}>
        <div className="pl-3.5 flex-shrink-0">
          {loading
            ? <Loader2 size={17} className="text-primary-500 animate-spin" />
            : <Search  size={17} className="text-dark-400 dark:text-dark-500" />
          }
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands, categories…"
          className="flex-1 px-3 py-2.5 text-sm bg-transparent text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }} className="pr-2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 p-1">
            <X size={15} />
          </button>
        )}
        <button
          onClick={() => handleSubmit()}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white transition-colors flex-shrink-0 text-sm font-medium"
        >
          Search
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 shadow-2xl z-50 overflow-hidden animate-slide-down max-h-[480px] overflow-y-auto">

          {/* Instant results */}
          {results.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1.5 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Products</p>
              {results.map((r, i) => (
                <button
                  key={r.id}
                  onMouseDown={() => { navigate(`/products/${r.slug}`); setOpen(false); setQuery(''); }}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors text-left',
                    i === focused && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-dark-100 dark:bg-dark-700 overflow-hidden flex-shrink-0">
                    {r.image && <img src={r.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{r.name}</p>
                    <p className="text-xs text-dark-500 dark:text-dark-400">{r.category?.name}{r.brand ? ` · ${r.brand}` : ''}</p>
                  </div>
                  <p className="text-sm font-bold text-primary-600 flex-shrink-0">€{r.final_price.toFixed(2)}</p>
                </button>
              ))}
              <button
                onMouseDown={() => handleSubmit()}
                className="w-full px-4 py-2.5 text-sm text-primary-600 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center justify-between border-t border-dark-100 dark:border-dark-700"
              >
                <span>See all results for "{query}"</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-dark-500 dark:text-dark-400">
              No results found for <span className="font-semibold text-dark-700 dark:text-dark-200">"{query}"</span>
            </div>
          )}

          {/* Recent & Trending (shown when no query) */}
          {!query && (
            <div className="p-3 grid sm:grid-cols-2 gap-3">
              {/* Recent */}
              {recent.length > 0 && (
                <div>
                  <p className="px-1 pb-1.5 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={11} /> Recent
                  </p>
                  {recent.map(term => (
                    <div key={term} className="flex items-center group">
                      <button
                        onMouseDown={() => { setQuery(term); doSearch(term); }}
                        className="flex-1 text-left px-2 py-1.5 text-sm text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 truncate"
                      >
                        {term}
                      </button>
                      <button
                        onMouseDown={(e) => { e.preventDefault(); clearRecent(term); }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-dark-400 hover:text-dark-600 rounded transition-all"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Trending */}
              <div>
                <p className="px-1 pb-1.5 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={11} /> Trending
                </p>
                {TRENDING.map(term => (
                  <button
                    key={term}
                    onMouseDown={() => { setQuery(term); doSearch(term); }}
                    className="w-full text-left px-2 py-1.5 text-sm text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 flex items-center gap-2"
                  >
                    <TrendingUp size={12} className="text-dark-400 dark:text-dark-500 flex-shrink-0" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
