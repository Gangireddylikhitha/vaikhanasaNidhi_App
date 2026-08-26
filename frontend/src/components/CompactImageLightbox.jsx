import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function CompactImageLightbox({ items, index, onClose }) {
  const [cur, setCur] = useState(index);
  const item = items[cur];
  const hasPrev = cur > 0;
  const hasNext = cur < items.length - 1;

  useEffect(() => {
    setCur(index);
  }, [index]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const goPrev = useCallback(() => {
    setCur((c) => Math.max(0, c - 1));
  }, []);

  const goNext = useCallback(() => {
    setCur((c) => Math.min(items.length - 1, c + 1));
  }, [items.length]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft' && cur > 0) goPrev();
      if (e.key === 'ArrowRight' && cur < items.length - 1) goNext();
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cur, items.length, goPrev, goNext, onClose]);

  if (!item) return null;

  // Full-screen photo viewer always sits on black, regardless of app theme —
  // a light stage would show as pale letterboxing around non-full-bleed images.
  const stageBg = '#000000';
  const counterColor = 'rgba(255,255,255,0.75)';
  const captionColor = 'rgba(255,255,255,0.9)';

  const arrowClass = 'text-white bg-black/55 hover:bg-black/75 disabled:hover:bg-black/55';
  const closeClass = 'text-white/80 hover:text-white bg-white/10 hover:bg-white/20';

  return (
    <div
      className="fixed inset-0 z-[100]"
      style={{ background: stageBg }}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      {/* Image fills the entire screen — controls float on top of it instead of taking their own rows. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={`${cur}-${item.url}`}
            src={item.url}
            alt={item.caption || ''}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.22 }}
            className="w-full h-full max-w-full max-h-full object-contain touch-pan-y"
            draggable={false}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_e, info) => {
              const { offset, velocity } = info;
              if (offset.x < -60 || velocity.x < -400) {
                if (hasNext) goNext();
              } else if (offset.x > 60 || velocity.x > 400) {
                if (hasPrev) goPrev();
              }
            }}
          />
        </AnimatePresence>
      </div>

      <div
        className="absolute top-0 inset-x-0 flex items-center justify-between px-4 pt-4 pb-8 z-40 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)' }}
      >
        <p className="text-xs sm:text-sm tabular-nums" style={{ color: counterColor }}>
          {cur + 1} / {items.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className={`p-2 rounded-full transition-colors pointer-events-auto ${closeClass}`}
          aria-label="Close"
        >
          <X size={22} />
        </button>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
        disabled={!hasPrev}
        className={`absolute top-1/2 -translate-y-1/2 z-30 left-2 sm:left-4 md:left-6 p-3 sm:p-3.5 rounded-full shadow-lg transition-all disabled:opacity-35 disabled:pointer-events-none ${arrowClass}`}
        aria-label="Previous image"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); goNext(); }}
        disabled={!hasNext}
        className={`absolute top-1/2 -translate-y-1/2 z-30 right-2 sm:right-4 md:right-6 p-3 sm:p-3.5 rounded-full shadow-lg transition-all disabled:opacity-35 disabled:pointer-events-none ${arrowClass}`}
        aria-label="Next image"
      >
        <ChevronRight size={28} />
      </button>

      {item.caption && (
        <div
          className="absolute bottom-0 inset-x-0 px-4 pt-8 pb-4 text-center z-40 pointer-events-none"
          style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, transparent 100%)' }}
        >
          <p className="text-xs sm:text-sm" style={{ fontFamily: 'Tiro Telugu, serif', color: captionColor }}>
            {item.caption}
          </p>
        </div>
      )}
    </div>
  );
}
