import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useThemeMode } from '../hooks/useThemeMode';

export default function CompactImageLightbox({ items, index, onClose }) {
  const { isDark } = useThemeMode();
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

  const shellBg = isDark ? 'rgba(0, 0, 0, 0.94)' : 'var(--bg-page)';
  const barBg = isDark ? 'rgba(0, 0, 0, 0.45)' : 'var(--bg-card)';
  const stageBg = isDark ? '#0a0a0a' : 'var(--bg-elevated)';
  const counterColor = isDark ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)';
  const captionColor = isDark ? 'rgba(255,255,255,0.88)' : 'var(--text-body)';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'var(--border-subtle)';

  const arrowClass = isDark
    ? 'text-white bg-black/55 hover:bg-black/75 disabled:hover:bg-black/55'
    : 'text-gray-800 bg-white/90 hover:bg-white shadow-md border border-gray-200/80 disabled:hover:bg-white/90';

  const closeClass = isDark
    ? 'text-white/80 hover:text-white bg-white/10 hover:bg-white/20'
    : 'text-gray-700 hover:text-gray-900 bg-black/5 hover:bg-black/10';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: shellBg }}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: barBg, borderBottom: `1px solid ${borderColor}` }}
      >
        <p className="text-xs sm:text-sm tabular-nums" style={{ color: counterColor }}>
          {cur + 1} / {items.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className={`p-2 rounded-full transition-colors ${closeClass}`}
          aria-label="Close"
        >
          <X size={22} />
        </button>
      </div>

      <div
        className="relative flex-1 min-h-0 w-full flex items-center justify-center px-14 sm:px-20 md:px-24"
        style={{ background: stageBg }}
        onClick={onClose}
      >
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

        <div
          className="w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={`${cur}-${item.url}`}
              src={item.url}
              alt={item.caption || ''}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.22 }}
              className="w-full h-full max-w-full max-h-full object-contain"
              draggable={false}
            />
          </AnimatePresence>
        </div>
      </div>

      {item.caption && (
        <div
          className="flex-shrink-0 px-4 py-3 text-center"
          style={{ background: barBg, borderTop: `1px solid ${borderColor}` }}
        >
          <p className="text-xs sm:text-sm" style={{ fontFamily: 'Tiro Telugu, serif', color: captionColor }}>
            {item.caption}
          </p>
        </div>
      )}
    </div>
  );
}
