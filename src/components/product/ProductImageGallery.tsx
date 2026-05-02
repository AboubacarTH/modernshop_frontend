import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X, Expand } from 'lucide-react';
import clsx from 'clsx';

interface ProductImage {
  url: string;
  alt?: string;
}

interface Props {
  images: ProductImage[];
  productName: string;
}

// ─── Zoom Lens ────────────────────────────────────────────────────────────────
function ZoomLens({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lensPos, setLensPos]     = useState({ x: 0, y: 0 });
  const [showLens, setShowLens]   = useState(false);
  const [zoomPos, setZoomPos]     = useState({ x: 0, y: 0 });

  const LENS_SIZE = 120;
  const ZOOM      = 2.5;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lx = Math.max(LENS_SIZE / 2, Math.min(rect.width  - LENS_SIZE / 2, x));
    const ly = Math.max(LENS_SIZE / 2, Math.min(rect.height - LENS_SIZE / 2, y));

    setLensPos({ x: lx - LENS_SIZE / 2, y: ly - LENS_SIZE / 2 });

    const zx = ((lx / rect.width)  * 100);
    const zy = ((ly / rect.height) * 100);
    setZoomPos({ x: zx, y: zy });
  }, []);

  return (
    <div className="flex gap-4 items-start">
      {/* Main image with lens */}
      <div
        ref={containerRef}
        className="relative flex-1 aspect-square bg-dark-50 dark:bg-dark-800 rounded-2xl overflow-hidden cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowLens(true)}
        onMouseLeave={() => setShowLens(false)}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" draggable={false} />

        {/* Lens box */}
        {showLens && (
          <div
            className="absolute border-2 border-primary-500 bg-primary-100/20 pointer-events-none rounded"
            style={{
              width:  LENS_SIZE,
              height: LENS_SIZE,
              left:   lensPos.x,
              top:    lensPos.y,
            }}
          />
        )}

        {!showLens && (
          <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
            <ZoomIn size={12} /> Hover to zoom
          </div>
        )}
      </div>

      {/* Zoom result panel */}
      <div
        className={clsx(
          'hidden lg:block w-64 h-64 rounded-2xl border-2 border-primary-200 dark:border-primary-800 overflow-hidden flex-shrink-0 shadow-xl transition-opacity duration-200',
          showLens ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        style={{
          backgroundImage:    `url(${src})`,
          backgroundSize:     `${ZOOM * 100}%`,
          backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
          backgroundRepeat:   'no-repeat',
        }}
      />
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ images, index, onClose }: { images: ProductImage[]; index: number; onClose: () => void }) {
  const [current, setCurrent] = useState(index);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowRight')  setCurrent(c => (c + 1) % images.length);
      if (e.key === 'ArrowLeft')   setCurrent(c => (c - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  const prev = () => setCurrent(c => (c - 1 + images.length) % images.length);
  const next = () => setCurrent(c => (c + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
      >
        <X size={20} />
      </button>

      <div className="relative max-w-4xl w-full px-16" onClick={e => e.stopPropagation()}>
        <img
          src={images[current].url}
          alt={images[current].alt || ''}
          className="w-full max-h-[80vh] object-contain rounded-xl"
        />

        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div className="flex justify-center gap-2 mt-4">
          {images.map((img, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={clsx('w-12 h-12 rounded-lg overflow-hidden border-2 transition-all', i === current ? 'border-primary-400 opacity-100' : 'border-transparent opacity-50 hover:opacity-75')}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <p className="text-center text-white/50 text-sm mt-3">{current + 1} / {images.length}</p>
      </div>
    </div>
  );
}

// ─── Main Gallery Component ───────────────────────────────────────────────────
export default function ProductImageGallery({ images, productName }: Props) {
  const [selected, setSelected]       = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fallback = [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', alt: productName }];
  const imgs     = images?.length ? images : fallback;

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setSelected(s => (s - 1 + imgs.length) % imgs.length); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setSelected(s => (s + 1) % imgs.length); };

  return (
    <div className="flex flex-col gap-3">
      {/* Main + zoom */}
      <div className="relative group">
        <ZoomLens src={imgs[selected].url} alt={imgs[selected].alt || productName} />

        {/* Expand to lightbox */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm flex items-center justify-center text-dark-600 dark:text-dark-300 hover:bg-white dark:hover:bg-dark-700 transition-colors shadow"
        >
          <Expand size={15} />
        </button>

        {/* Prev/Next on mobile */}
        {imgs.length > 1 && (
          <>
            <button onClick={prev} className="lg:hidden absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center text-dark-700">
              <ChevronLeft size={16} />
            </button>
            <button onClick={next} className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center text-dark-700">
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={clsx(
                'flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all',
                i === selected
                  ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                  : 'border-dark-200 dark:border-dark-700 hover:border-dark-400 opacity-70 hover:opacity-100'
              )}
            >
              <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox images={imgs} index={selected} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}
