import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Camera, X, ThumbsUp, ShieldCheck, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Review {
  id: number;
  rating: number;
  title?: string;
  body: string;
  is_verified_purchase: boolean;
  created_at: string;
  helpful_count?: number;
  photos?: string[];
  user: { name: string; avatar?: string };
}

interface Props {
  productId: number;
  productSlug: string;
  reviews: Review[];
  averageRating: number;
  reviewsCount: number;
}

// ─── Star Picker ──────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(s)}
            className="transition-transform hover:scale-125 active:scale-110"
          >
            <Star
              size={28}
              className={clsx(
                'transition-colors',
                s <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-dark-200 dark:text-dark-600 fill-dark-200 dark:fill-dark-600'
              )}
            />
          </button>
        ))}
      </div>
      {(hover || value) > 0 && (
        <span className="text-sm font-medium text-dark-700 dark:text-dark-300">{labels[hover || value]}</span>
      )}
    </div>
  );
}

// ─── Rating Breakdown ─────────────────────────────────────────────────────────
function RatingBreakdown({ reviews, average, count }: { reviews: Review[]; average: number; count: number }) {
  const bars = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
    pct:   count > 0 ? (reviews.filter(r => r.rating === s).length / count) * 100 : 0,
  }));

  return (
    <div className="flex gap-6 items-center p-4 bg-dark-50 dark:bg-dark-800/50 rounded-xl mb-6">
      {/* Big score */}
      <div className="text-center flex-shrink-0">
        <p className="text-5xl font-bold text-dark-900 dark:text-white">{average}</p>
        <div className="flex justify-center gap-0.5 my-1">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={14} className={s <= Math.round(average) ? 'text-amber-400 fill-amber-400' : 'text-dark-200 fill-dark-200'} />
          ))}
        </div>
        <p className="text-xs text-dark-500 dark:text-dark-400">{count} reviews</p>
      </div>

      {/* Bars */}
      <div className="flex-1 space-y-1.5">
        {bars.map(b => (
          <div key={b.star} className="flex items-center gap-2">
            <span className="text-xs text-dark-500 dark:text-dark-400 w-3">{b.star}</span>
            <Star size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
            <div className="flex-1 h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${b.pct}%` }}
              />
            </div>
            <span className="text-xs text-dark-500 dark:text-dark-400 w-5 text-right">{b.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Write Review Form ────────────────────────────────────────────────────────
function ReviewForm({ productId, productSlug, onSuccess }: { productId: number; productSlug: string; onSuccess: () => void }) {
  const { isAuthenticated } = useAuthStore();
  const [rating,  setRating]  = useState(0);
  const [title,   setTitle]   = useState('');
  const [body,    setBody]     = useState('');
  const [photos,  setPhotos]  = useState<{ file: File; preview: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = useMutation({
    mutationFn: async () => {
      // If photos: use FormData
      if (photos.length > 0) {
        const fd = new FormData();
        fd.append('rating', String(rating));
        fd.append('title',  title);
        fd.append('body',   body);
        photos.forEach(p => fd.append('photos[]', p.file));
        return api.post(`/products/${productSlug}/reviews`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return api.post(`/products/${productSlug}/reviews`, { rating, title, body });
    },
    onSuccess: () => {
      toast.success('Review submitted!');
      setRating(0); setTitle(''); setBody(''); setPhotos([]);
      onSuccess();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit review'),
  });

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - photos.length);
    const previews = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setPhotos(p => [...p, ...previews]);
  };

  const removePhoto = (i: number) => {
    URL.revokeObjectURL(photos[i].preview);
    setPhotos(p => p.filter((_, idx) => idx !== i));
  };

  if (!isAuthenticated()) {
    return (
      <div className="text-center py-8 text-sm text-dark-500 dark:text-dark-400 bg-dark-50 dark:bg-dark-800/50 rounded-xl">
        <p>Please <a href="/login" className="text-primary-600 font-medium hover:underline">sign in</a> to write a review.</p>
      </div>
    );
  }

  return (
    <form onSubmit={e => { e.preventDefault(); if (!rating) { toast.error('Please select a rating'); return; } submit.mutate(); }} className="card p-5 space-y-4 dark:bg-dark-800 dark:border-dark-700">
      <h3 className="font-semibold text-dark-900 dark:text-white">Write a Review</h3>

      <div>
        <label className="label dark:text-dark-300">Your Rating *</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="label dark:text-dark-300">Title</label>
        <input className="input dark:bg-dark-700 dark:border-dark-600 dark:text-white dark:placeholder-dark-400" placeholder="Summarize your experience" value={title} onChange={e => setTitle(e.target.value)} maxLength={100} />
      </div>

      <div>
        <label className="label dark:text-dark-300">Review *</label>
        <textarea
          className="input resize-none dark:bg-dark-700 dark:border-dark-600 dark:text-white dark:placeholder-dark-400"
          rows={4}
          placeholder="Share your experience with this product…"
          value={body}
          onChange={e => setBody(e.target.value)}
          minLength={10}
          required
        />
        <p className="text-xs text-dark-400 dark:text-dark-500 mt-1 text-right">{body.length} / 1000</p>
      </div>

      {/* Photo upload */}
      <div>
        <label className="label dark:text-dark-300 flex items-center gap-1.5"><Camera size={14} /> Add Photos (optional)</label>
        <div className="flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-dark-200 dark:border-dark-600">
              <img src={p.preview} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removePhoto(i)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                <X size={10} />
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-lg border-2 border-dashed border-dark-300 dark:border-dark-600 flex flex-col items-center justify-center gap-1 text-dark-400 dark:text-dark-500 hover:border-primary-400 hover:text-primary-500 transition-colors"
            >
              <Camera size={18} />
              <span className="text-xs">Add</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
        </div>
        <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">Up to 5 photos, max 5MB each</p>
      </div>

      <button type="submit" disabled={submit.isPending || !rating} className="btn-primary">
        {submit.isPending ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Submit Review'}
      </button>
    </form>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const [helpful, setHelpful] = useState(false);

  return (
    <div className="card p-4 dark:bg-dark-800 dark:border-dark-700">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm flex-shrink-0">
            {review.user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-dark-900 dark:text-white text-sm">{review.user?.name}</p>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-dark-400 dark:text-dark-500">{new Date(review.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              {review.is_verified_purchase && (
                <span className="flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400 font-medium">
                  <ShieldCheck size={11} /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-shrink-0">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={13} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-dark-200 dark:text-dark-600 fill-dark-200 dark:fill-dark-600'} />
          ))}
        </div>
      </div>

      {review.title && <p className="font-semibold text-dark-900 dark:text-white text-sm mb-1">{review.title}</p>}
      <p className="text-dark-600 dark:text-dark-300 text-sm leading-relaxed">{review.body}</p>

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {review.photos.map((url, i) => (
            <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-dark-200 dark:border-dark-600 cursor-pointer hover:opacity-90 transition-opacity" />
          ))}
        </div>
      )}

      {/* Helpful */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dark-100 dark:border-dark-700">
        <span className="text-xs text-dark-500 dark:text-dark-400">Helpful?</span>
        <button
          onClick={() => setHelpful(!helpful)}
          className={clsx(
            'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all',
            helpful
              ? 'border-primary-400 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
              : 'border-dark-200 dark:border-dark-600 text-dark-500 dark:text-dark-400 hover:border-primary-300'
          )}
        >
          <ThumbsUp size={11} /> Yes {helpful ? '✓' : ''}
        </button>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ProductReviews({ productId, productSlug, reviews, averageRating, reviewsCount }: Props) {
  const queryClient = useQueryClient();

  return (
    <div className="space-y-6">
      {reviewsCount > 0 && (
        <RatingBreakdown reviews={reviews} average={averageRating} count={reviewsCount} />
      )}

      <ReviewForm
        productId={productId}
        productSlug={productSlug}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['product', productSlug] })}
      />

      {reviews.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-dark-900 dark:text-white flex items-center justify-between">
            Customer Reviews
            <span className="text-sm font-normal text-dark-500 dark:text-dark-400">{reviewsCount} total</span>
          </h3>
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}

      {reviews.length === 0 && (
        <div className="text-center py-10 text-dark-400 dark:text-dark-500">
          <Star size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-dark-700 dark:text-dark-300">No reviews yet</p>
          <p className="text-sm mt-1">Be the first to share your experience!</p>
        </div>
      )}
    </div>
  );
}
