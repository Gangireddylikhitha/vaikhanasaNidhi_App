import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut, List } from 'lucide-react';

const ZOOM_MIN = 0.75;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

/** Continuous vertical PDF-style reader with reliable CSS zoom. */
export default function BookVisualReaderLayout({
  scripture,
  pageIdx,
  totalPages,
  loading = false,
  onGoTo,
  onVisiblePage,
  children,
}) {
  const viewportRef = useRef(null);
  const pageRefs = useRef([]);
  const scrollingToRef = useRef(null);
  const [jumpValue, setJumpValue] = useState(String(pageIdx + 1));
  const [showJump, setShowJump] = useState(false);
  const [zoom, setZoom] = useState(1);

  const displayTotal = scripture?.page_count || totalPages;
  const currentPage = pageIdx + 1;

  useEffect(() => {
    setJumpValue(String(pageIdx + 1));
  }, [pageIdx]);

  useEffect(() => {
    setZoom(1);
  }, [scripture?.id]);

  const scrollToPage = useCallback((idx, behavior = 'smooth') => {
    const el = pageRefs.current[idx];
    const vp = viewportRef.current;
    if (!el || !vp) return;
    scrollingToRef.current = idx;
    const top = el.offsetTop - 4;
    vp.scrollTo({ top, behavior });
    onGoTo?.(idx);
    window.setTimeout(() => {
      if (scrollingToRef.current === idx) scrollingToRef.current = null;
    }, behavior === 'smooth' ? 450 : 50);
  }, [onGoTo]);

  const handlePrev = useCallback(() => {
    if (pageIdx > 0 && !loading) scrollToPage(pageIdx - 1);
  }, [pageIdx, loading, scrollToPage]);

  const handleNext = useCallback(() => {
    if (pageIdx < totalPages - 1 && !loading) scrollToPage(pageIdx + 1);
  }, [pageIdx, totalPages, loading, scrollToPage]);

  const applyZoom = useCallback((nextZoom) => {
    const vp = viewportRef.current;
    const pageEl = pageRefs.current[pageIdx];
    const prevTop = pageEl && vp ? pageEl.offsetTop - vp.scrollTop : 0;
    setZoom(nextZoom);
    // Keep the current page roughly in place after width change
    requestAnimationFrame(() => {
      const vp2 = viewportRef.current;
      const page2 = pageRefs.current[pageIdx];
      if (!vp2 || !page2) return;
      vp2.scrollTop = Math.max(0, page2.offsetTop - prevTop);
    });
  }, [pageIdx]);

  const zoomIn = useCallback(() => {
    applyZoom(Math.min(ZOOM_MAX, +(zoom + ZOOM_STEP).toFixed(2)));
  }, [zoom, applyZoom]);

  const zoomOut = useCallback(() => {
    applyZoom(Math.max(ZOOM_MIN, +(zoom - ZOOM_STEP).toFixed(2)));
  }, [zoom, applyZoom]);

  const zoomReset = useCallback(() => {
    applyZoom(1);
  }, [applyZoom]);

  function handleJumpSubmit(e) {
    e?.preventDefault();
    const num = parseInt(jumpValue, 10);
    if (!Number.isFinite(num) || num < 1 || num > totalPages) return;
    scrollToPage(num - 1);
    setShowJump(false);
  }

  // Track which page is in view while scrolling
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || totalPages < 1) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingToRef.current != null) return;
        let best = null;
        let bestRatio = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number(entry.target.getAttribute('data-page-index'));
          if (!Number.isFinite(idx)) continue;
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = idx;
          }
        }
        if (best != null) onVisiblePage?.(best);
      },
      {
        root: vp,
        threshold: [0.15, 0.35, 0.55, 0.75],
        rootMargin: '-10% 0px -35% 0px',
      },
    );

    pageRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [totalPages, children, onVisiblePage, zoom]);

  // Initial scroll position
  useEffect(() => {
    if (loading) return undefined;
    const id = window.setTimeout(() => {
      const el = pageRefs.current[pageIdx];
      const vp = viewportRef.current;
      if (!el || !vp) return;
      scrollingToRef.current = pageIdx;
      vp.scrollTop = el.offsetTop - 4;
      scrollingToRef.current = null;
    }, 40);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, totalPages, scripture?.id]);

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomIn(); }
      if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomOut(); }
      if (e.key === '0') { e.preventDefault(); zoomReset(); }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      }
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePrev, handleNext, zoomIn, zoomOut, zoomReset]);

  const childList = Array.isArray(children) ? children : [children];
  const zoomPct = Math.round(zoom * 100);

  return (
    <div className="book-swipe-reader">
      <div className="book-swipe-toolbar">
        <div className="book-swipe-controls-bar">
          <button type="button" onClick={() => setShowJump((s) => !s)}
            className="book-swipe-pill" aria-label="Jump to page">
            <List size={15} />
          </button>
          <button type="button" onClick={handlePrev} disabled={pageIdx === 0 || loading}
            className="book-swipe-pill disabled:opacity-35" aria-label="Previous page">
            <ChevronDown size={17} />
          </button>
          <span className="book-swipe-page-label tabular-nums">
            {currentPage} / {displayTotal}
          </span>
          <button type="button" onClick={handleNext} disabled={pageIdx >= totalPages - 1 || loading}
            className="book-swipe-pill disabled:opacity-35" aria-label="Next page">
            <ChevronUp size={17} />
          </button>
          <button type="button" onClick={zoomOut} disabled={zoom <= ZOOM_MIN}
            className="book-swipe-pill p-2 disabled:opacity-35" aria-label="Zoom out">
            <ZoomOut size={14} />
          </button>
          <button
            type="button"
            onClick={zoomReset}
            className="book-swipe-pill book-swipe-zoom-label tabular-nums"
            title="Tap to reset zoom"
            aria-label={`Zoom ${zoomPct} percent. Tap to reset`}
          >
            {zoomPct}%
          </button>
          <button type="button" onClick={zoomIn} disabled={zoom >= ZOOM_MAX}
            className="book-swipe-pill p-2 disabled:opacity-35" aria-label="Zoom in">
            <ZoomIn size={14} />
          </button>
        </div>

        {showJump && (
          <div className="book-swipe-jump-panel">
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpValue}
                onChange={(e) => setJumpValue(e.target.value)}
                className="book-page-jump-input w-16 text-center text-sm font-bold tabular-nums rounded-lg px-2 py-1.5"
                aria-label="Page number"
                autoFocus
              />
              <span className="text-xs text-muted tabular-nums">/ {displayTotal}</span>
              <button type="submit" disabled={loading} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold btn-gold">
                Go
              </button>
              <button type="button" onClick={() => setShowJump(false)}
                className="px-2 py-1.5 rounded-lg text-xs text-muted hover:text-white">
                ✕
              </button>
            </form>
            <input
              type="range"
              min={1}
              max={Math.max(totalPages, 1)}
              value={currentPage}
              onChange={(e) => scrollToPage(Number(e.target.value) - 1)}
              className="book-reader-slider w-full mt-2"
              aria-label="Go to page"
            />
          </div>
        )}
      </div>

      <div ref={viewportRef} className="book-scroll-viewport">
        <div
          className={`book-scroll-strip${zoom > 1.01 ? ' is-zoomed' : ''}`}
          style={{
            width: `${zoom * 100}%`,
            minWidth: zoom < 1 ? `${zoom * 100}%` : '100%',
          }}
        >
          {childList.map((child, i) => (
            <div
              key={child?.key ?? `page-${i}`}
              data-page-index={i}
              ref={(node) => { pageRefs.current[i] = node; }}
              className="book-scroll-page"
            >
              {child}
              <span className="book-scroll-page-badge tabular-nums">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
