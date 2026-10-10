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
  const [isPinching, setIsPinching] = useState(false);
  const isPinchingRef = useRef(false);
  const pinchRef = useRef({ active: false, startDist: 0, startZoom: 1, focalX: 0, focalY: 0, contentX: 0, contentY: 0 });
  const touchDownRef = useRef({ x: 0, y: 0, time: 0, moved: false });
  const lastTapRef = useRef({ time: 0, x: 0, y: 0 });
  const mouseDownRef = useRef({ x: 0, y: 0, time: 0, moved: false, isDown: false });

  const displayTotal = scripture?.page_count || totalPages;
  const currentPage = pageIdx + 1;

  const [prevPageIdx, setPrevPageIdx] = useState(pageIdx);
  if (prevPageIdx !== pageIdx) {
    setPrevPageIdx(pageIdx);
    setJumpValue(String(pageIdx + 1));
  }

  const [prevScriptureId, setPrevScriptureId] = useState(scripture?.id);
  if (prevScriptureId !== scripture?.id) {
    setPrevScriptureId(scripture?.id);
    setZoom(1);
  }

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

  const applyZoomCentered = useCallback((nextZoom, clientX, clientY) => {
    const vp = viewportRef.current;
    if (!vp) {
      setZoom(nextZoom);
      return;
    }
    const rect = vp.getBoundingClientRect();
    const focalX = (clientX != null ? clientX : rect.left + rect.width / 2) - rect.left;
    const focalY = (clientY != null ? clientY : rect.top + rect.height / 2) - rect.top;
    const currentZoom = zoom;
    const ratio = nextZoom / currentZoom;
    const contentX = vp.scrollLeft + focalX;
    const contentY = vp.scrollTop + focalY;

    setZoom(nextZoom);
    requestAnimationFrame(() => {
      const vp2 = viewportRef.current;
      if (!vp2) return;
      vp2.scrollLeft = Math.max(0, contentX * ratio - focalX);
      vp2.scrollTop = Math.max(0, contentY * ratio - focalY);
    });
  }, [zoom]);

  const zoomIn = useCallback(() => {
    applyZoom(Math.min(ZOOM_MAX, +(zoom + ZOOM_STEP).toFixed(2)));
  }, [zoom, applyZoom]);

  const zoomOut = useCallback(() => {
    applyZoom(Math.max(ZOOM_MIN, +(zoom - ZOOM_STEP).toFixed(2)));
  }, [zoom, applyZoom]);

  const zoomReset = useCallback(() => {
    setZoom(1);
    requestAnimationFrame(() => {
      const vp = viewportRef.current;
      const pageEl = pageRefs.current[pageIdx];
      if (vp && pageEl) {
        vp.scrollLeft = 0;
        vp.scrollTo({ top: Math.max(0, pageEl.offsetTop - 4), behavior: 'smooth' });
      }
    });
  }, [pageIdx]);

  function handleJumpSubmit(e) {
    e?.preventDefault();
    const num = parseInt(jumpValue, 10);
    if (!Number.isFinite(num) || num < 1 || num > totalPages) return;
    scrollToPage(num - 1);
    setShowJump(false);
  }

  // Multi-touch pinch-to-zoom on mobile and touch devices
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return undefined;

    function onTouchStart(e) {
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        const rect = vp.getBoundingClientRect();
        const focalX = midX - rect.left;
        const focalY = midY - rect.top;

        pinchRef.current = {
          active: true,
          startDist: dist,
          startZoom: zoom,
          focalX,
          focalY,
          contentX: vp.scrollLeft + focalX,
          contentY: vp.scrollTop + focalY,
        };
        isPinchingRef.current = true;
        setIsPinching(true);
      } else if (e.touches.length === 1) {
        touchDownRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now(),
          moved: false,
        };
      }
    }

    function onTouchMove(e) {
      if (e.touches.length === 2 && pinchRef.current.active) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const newDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const scaleRatio = newDist / (pinchRef.current.startDist || 1);
        const rawZoom = pinchRef.current.startZoom * scaleRatio;
        const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +rawZoom.toFixed(2)));

        setZoom(nextZoom);

        const zoomRatio = nextZoom / (pinchRef.current.startZoom || 1);
        const targetScrollLeft = pinchRef.current.contentX * zoomRatio - pinchRef.current.focalX;
        const targetScrollTop = pinchRef.current.contentY * zoomRatio - pinchRef.current.focalY;

        vp.scrollLeft = Math.max(0, targetScrollLeft);
        vp.scrollTop = Math.max(0, targetScrollTop);
      } else if (e.touches.length === 1 && !pinchRef.current.active) {
        const dx = e.touches[0].clientX - touchDownRef.current.x;
        const dy = e.touches[0].clientY - touchDownRef.current.y;
        if (Math.hypot(dx, dy) > 10) {
          touchDownRef.current.moved = true;
        }
      }
    }

    function onTouchEnd(e) {
      if (pinchRef.current.active) {
        if (e.touches.length < 2) {
          pinchRef.current.active = false;
          isPinchingRef.current = false;
          setIsPinching(false);
          // Snap back if close to 1x
          setZoom((current) => {
            if (current >= 0.93 && current <= 1.07) {
              return 1;
            }
            return current;
          });
        }
      } else if (e.touches.length === 0) {
        const elapsed = Date.now() - touchDownRef.current.time;
        if (!touchDownRef.current.moved && elapsed < 320) {
          // It is a clean finger tap!
          if (zoom > 1.05) {
            // "when i click on pdf finger it should zoom out"
            zoomReset();
          } else {
            // Check for double-tap to zoom in
            const now = Date.now();
            const timeSinceLast = now - lastTapRef.current.time;
            const distFromLast = Math.hypot(
              touchDownRef.current.x - lastTapRef.current.x,
              touchDownRef.current.y - lastTapRef.current.y
            );
            if (timeSinceLast < 320 && distFromLast < 35) {
              applyZoomCentered(2.0, touchDownRef.current.x, touchDownRef.current.y);
              lastTapRef.current = { time: 0, x: 0, y: 0 };
            } else {
              lastTapRef.current = {
                time: now,
                x: touchDownRef.current.x,
                y: touchDownRef.current.y,
              };
            }
          }
        }
      }
    }

    function onWheel(e) {
      // Trackpad pinch gesture or Ctrl + Mouse Wheel on desktop website
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.005;
        const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(zoom + delta).toFixed(2)));
        applyZoomCentered(nextZoom, e.clientX, e.clientY);
      }
    }

    vp.addEventListener('touchstart', onTouchStart, { passive: true });
    vp.addEventListener('touchmove', onTouchMove, { passive: false });
    vp.addEventListener('touchend', onTouchEnd, { passive: true });
    vp.addEventListener('touchcancel', onTouchEnd, { passive: true });
    vp.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      vp.removeEventListener('touchstart', onTouchStart);
      vp.removeEventListener('touchmove', onTouchMove);
      vp.removeEventListener('touchend', onTouchEnd);
      vp.removeEventListener('touchcancel', onTouchEnd);
      vp.removeEventListener('wheel', onWheel);
    };
  }, [zoom, applyZoomCentered, zoomReset]);

  // Mouse click handling on desktop: click when zoomed in zooms out to 100%
  function handleMouseDown(e) {
    mouseDownRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      moved: false,
      isDown: true,
    };
  }

  function handleMouseMove(e) {
    if (mouseDownRef.current.isDown) {
      const dist = Math.hypot(
        e.clientX - mouseDownRef.current.x,
        e.clientY - mouseDownRef.current.y
      );
      if (dist > 8) {
        mouseDownRef.current.moved = true;
      }
    }
  }

  function handleMouseUp() {
    mouseDownRef.current.isDown = false;
    const elapsed = Date.now() - mouseDownRef.current.time;
    if (!mouseDownRef.current.moved && elapsed < 350) {
      if (zoom > 1.05) {
        zoomReset();
      }
    }
  }

  function handleDoubleClick(e) {
    if (zoom <= 1.05) {
      applyZoomCentered(2.0, e.clientX, e.clientY);
    } else {
      zoomReset();
    }
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
    <div className="book-swipe-reader relative">
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

      <div
        ref={viewportRef}
        className="book-scroll-viewport"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className={`book-scroll-strip${zoom > 1.01 ? ' is-zoomed' : ''}${isPinching ? ' is-pinching' : ''}`}
          style={{
            width: `${zoom * 100}%`,
            minWidth: zoom < 1 ? `${zoom * 100}%` : '100%',
            transition: isPinching ? 'none' : undefined,
          }}
        >
          {childList.map((child, i) => (
            <div
              key={child?.key ?? `page-${i}`}
              data-page-index={i}
              ref={(node) => { pageRefs.current[i] = node; }}
              className={`book-scroll-page${zoom > 1.05 ? ' is-zoomed' : ''}`}
            >
              {child}
              <span className="book-scroll-page-badge tabular-nums">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {zoom > 1.05 && (
        <button
          type="button"
          onClick={zoomReset}
          className="book-swipe-zoom-float-badge"
          aria-label="Tap to zoom out (100%)"
        >
          <span>{zoomPct}% · Tap to zoom out</span>
        </button>
      )}
    </div>
  );
}
