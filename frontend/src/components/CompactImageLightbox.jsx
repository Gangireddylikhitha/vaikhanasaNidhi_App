import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.5;

function clampPan(x, y, scale, stageWidth, stageHeight) {
  if (scale <= 1 || !stageWidth || !stageHeight) return { x: 0, y: 0 };
  const maxX = Math.max(0, (stageWidth * (scale - 1)) / 2);
  const maxY = Math.max(0, (stageHeight * (scale - 1)) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, x)),
    y: Math.min(maxY, Math.max(-maxY, y)),
  };
}

export default function CompactImageLightbox({ items, index, onClose }) {
  const [cur, setCur] = useState(index);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const pinchRef = useRef({ active: false, startDist: 0, startZoom: 1, startPan: { x: 0, y: 0 }, focalX: 0, focalY: 0 });
  const touchDownRef = useRef({ x: 0, y: 0, time: 0, moved: false, startPan: { x: 0, y: 0 } });
  const lastTapRef = useRef({ time: 0, x: 0, y: 0 });
  const mouseDragRef = useRef({ isDown: false, startX: 0, startY: 0, startPan: { x: 0, y: 0 }, moved: false, time: 0 });

  const item = items[cur];
  const hasPrev = cur > 0;
  const hasNext = cur < items.length - 1;

  const [prevIndex, setPrevIndex] = useState(index);
  if (prevIndex !== index) {
    setPrevIndex(index);
    setCur(index);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  const [prevCur, setPrevCur] = useState(cur);
  if (prevCur !== cur) {
    setPrevCur(cur);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

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

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const applyZoomToPoint = useCallback((nextZoom, clientX, clientY) => {
    const stage = stageRef.current;
    if (!stage) {
      setZoom(nextZoom);
      if (nextZoom <= 1) setPan({ x: 0, y: 0 });
      return;
    }
    const rect = stage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clickOffsetX = (clientX != null ? clientX : centerX) - centerX;
    const clickOffsetY = (clientY != null ? clientY : centerY) - centerY;

    if (nextZoom <= 1.02) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const currentZoom = zoom;
    const ratio = nextZoom / currentZoom;
    const newPanX = (pan.x - clickOffsetX) * ratio + clickOffsetX;
    const newPanY = (pan.y - clickOffsetY) * ratio + clickOffsetY;

    setZoom(nextZoom);
    setPan(clampPan(newPanX, newPanY, nextZoom, rect.width, rect.height));
  }, [zoom, pan]);

  const zoomIn = useCallback(() => {
    const next = Math.min(ZOOM_MAX, +(zoom + ZOOM_STEP).toFixed(2));
    applyZoomToPoint(next);
  }, [zoom, applyZoomToPoint]);

  const zoomOut = useCallback(() => {
    const next = Math.max(ZOOM_MIN, +(zoom - ZOOM_STEP).toFixed(2));
    applyZoomToPoint(next);
  }, [zoom, applyZoomToPoint]);

  // Keyboard navigation & zoom shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') {
        if (zoom <= 1.05 && cur > 0) goPrev();
      } else if (e.key === 'ArrowRight') {
        if (zoom <= 1.05 && cur < items.length - 1) goNext();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        resetZoom();
      } else if (e.key === 'Escape') {
        if (zoom > 1.05) {
          resetZoom();
        } else {
          onClose();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cur, items.length, zoom, goPrev, goNext, zoomIn, zoomOut, resetZoom, onClose]);

  // Touch gesture handling (Pinch-to-zoom, pan when zoomed, tap to zoom out, double-tap zoom)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    function onTouchStart(e) {
      const rect = stage.getBoundingClientRect();
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        pinchRef.current = {
          active: true,
          startDist: dist,
          startZoom: zoom,
          startPan: { ...pan },
          focalX: midX - centerX,
          focalY: midY - centerY,
        };
        setIsPinching(true);
      } else if (e.touches.length === 1) {
        touchDownRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now(),
          moved: false,
          startPan: { ...pan },
        };
      }
    }

    function onTouchMove(e) {
      const rect = stage.getBoundingClientRect();
      if (e.touches.length === 2 && pinchRef.current.active) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const scaleRatio = dist / (pinchRef.current.startDist || 1);
        const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(pinchRef.current.startZoom * scaleRatio).toFixed(2)));

        const zoomRatio = nextZoom / (pinchRef.current.startZoom || 1);
        const newPanX = (pinchRef.current.startPan.x - pinchRef.current.focalX) * zoomRatio + pinchRef.current.focalX;
        const newPanY = (pinchRef.current.startPan.y - pinchRef.current.focalY) * zoomRatio + pinchRef.current.focalY;

        setZoom(nextZoom);
        setPan(clampPan(newPanX, newPanY, nextZoom, rect.width, rect.height));
      } else if (e.touches.length === 1 && !pinchRef.current.active) {
        const dx = e.touches[0].clientX - touchDownRef.current.x;
        const dy = e.touches[0].clientY - touchDownRef.current.y;
        if (Math.hypot(dx, dy) > 8) {
          touchDownRef.current.moved = true;
        }

        if (zoom > 1.02) {
          e.preventDefault();
          const targetX = touchDownRef.current.startPan.x + dx;
          const targetY = touchDownRef.current.startPan.y + dy;
          setPan(clampPan(targetX, targetY, zoom, rect.width, rect.height));
        }
      }
    }

    function onTouchEnd(e) {
      if (pinchRef.current.active) {
        if (e.touches.length < 2) {
          pinchRef.current.active = false;
          setIsPinching(false);
          setZoom((current) => {
            if (current <= 1.08) {
              setPan({ x: 0, y: 0 });
              return 1;
            }
            return current;
          });
        }
      } else if (e.touches.length === 0) {
        const elapsed = Date.now() - touchDownRef.current.time;
        const dx = touchDownRef.current.x;
        const dy = touchDownRef.current.y;

        if (!touchDownRef.current.moved && elapsed < 320) {
          // Clean finger tap!
          if (zoom > 1.05) {
            // "when i click on pdf finger it should zoom out and also for images for app and website"
            resetZoom();
          } else {
            // Check for double-tap to zoom in
            const now = Date.now();
            const timeSinceLast = now - lastTapRef.current.time;
            const distFromLast = Math.hypot(dx - lastTapRef.current.x, dy - lastTapRef.current.y);
            if (timeSinceLast < 320 && distFromLast < 35) {
              applyZoomToPoint(2.5, dx, dy);
              lastTapRef.current = { time: 0, x: 0, y: 0 };
            } else {
              lastTapRef.current = { time: now, x: dx, y: dy };
            }
          }
        } else if (zoom <= 1.05 && touchDownRef.current.moved) {
          // Swipe navigation between photos
          const endX = (e.changedTouches?.[0]?.clientX) ?? dx;
          const moveX = endX - dx;
          if (moveX < -55 && hasNext) {
            goNext();
          } else if (moveX > 55 && hasPrev) {
            goPrev();
          }
        }
      }
    }

    function onWheel(e) {
      e.preventDefault();
      const delta = -e.deltaY * 0.0035;
      const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(zoom + delta).toFixed(2)));
      applyZoomToPoint(nextZoom, e.clientX, e.clientY);
    }

    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchmove', onTouchMove, { passive: false });
    stage.addEventListener('touchend', onTouchEnd, { passive: true });
    stage.addEventListener('touchcancel', onTouchEnd, { passive: true });
    stage.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      stage.removeEventListener('touchend', onTouchEnd);
      stage.removeEventListener('touchcancel', onTouchEnd);
      stage.removeEventListener('wheel', onWheel);
    };
  }, [zoom, pan, hasPrev, hasNext, goPrev, goNext, resetZoom, applyZoomToPoint]);

  // Mouse desktop drag & click handling
  function handleMouseDown(e) {
    if (e.button !== 0) return;
    mouseDragRef.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      startPan: { ...pan },
      moved: false,
      time: Date.now(),
    };
    if (zoom > 1.02) {
      setIsDragging(true);
    }
  }

  function handleMouseMove(e) {
    if (!mouseDragRef.current.isDown) return;
    const dx = e.clientX - mouseDragRef.current.startX;
    const dy = e.clientY - mouseDragRef.current.startY;
    if (Math.hypot(dx, dy) > 6) {
      mouseDragRef.current.moved = true;
    }

    if (zoom > 1.02 && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const targetX = mouseDragRef.current.startPan.x + dx;
      const targetY = mouseDragRef.current.startPan.y + dy;
      setPan(clampPan(targetX, targetY, zoom, rect.width, rect.height));
    }
  }

  function handleMouseUp() {
    if (!mouseDragRef.current.isDown) return;
    mouseDragRef.current.isDown = false;
    setIsDragging(false);

    const elapsed = Date.now() - mouseDragRef.current.time;
    if (!mouseDragRef.current.moved && elapsed < 350) {
      // Crisp click
      if (zoom > 1.05) {
        resetZoom();
      }
    }
  }

  function handleDoubleClick(e) {
    if (zoom <= 1.05) {
      applyZoomToPoint(2.5, e.clientX, e.clientY);
    } else {
      resetZoom();
    }
  }

  if (!item) return null;

  const stageBg = '#000000';
  const counterColor = 'rgba(255,255,255,0.75)';
  const captionColor = 'rgba(255,255,255,0.9)';

  const arrowClass = 'text-white bg-black/55 hover:bg-black/75 disabled:hover:bg-black/55';
  const closeClass = 'text-white/80 hover:text-white bg-white/10 hover:bg-white/20';
  const zoomPct = Math.round(zoom * 100);

  return (
    <div
      className="fixed inset-0 z-[100] select-none"
      style={{ background: stageBg }}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      {/* Interactive viewport for zoom, pan, and gestures */}
      <div
        ref={stageRef}
        className="absolute inset-0 flex items-center justify-center overflow-hidden touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{
          cursor: zoom > 1.05 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${cur}-${item.url}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex items-center justify-center pointer-events-none"
          >
            <img
              ref={imgRef}
              src={item.url}
              alt={item.caption || ''}
              draggable={false}
              className="max-w-full max-h-full object-contain pointer-events-auto"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                transition: isPinching || isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
                cursor: zoom > 1.05 ? 'zoom-out' : 'zoom-in',
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Top Controls Bar */}
      <div
        className="absolute top-0 inset-x-0 flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4 pb-6 z-40 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
      >
        <p className="text-xs sm:text-sm tabular-nums font-medium" style={{ color: counterColor }}>
          {cur + 1} / {items.length}
        </p>

        {/* Zoom Controls Pill */}
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full px-2 py-1 border border-white/10 pointer-events-auto shadow-lg">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= ZOOM_MIN}
            className="p-1.5 rounded-full text-white/80 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums text-primary-gold hover:text-white transition-colors"
            title="Tap to reset zoom (100%)"
            aria-label={`Zoom ${zoomPct} percent. Tap to reset`}
          >
            {zoomPct}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= ZOOM_MAX}
            className="p-1.5 rounded-full text-white/80 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`p-2 rounded-full transition-colors pointer-events-auto ${closeClass}`}
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Prev / Next navigation arrows */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
        disabled={!hasPrev || zoom > 1.05}
        className={`absolute top-1/2 -translate-y-1/2 z-30 left-2 sm:left-4 md:left-6 p-3 sm:p-3.5 rounded-full shadow-lg transition-all disabled:opacity-0 disabled:pointer-events-none ${arrowClass}`}
        aria-label="Previous image"
      >
        <ChevronLeft size={26} />
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); goNext(); }}
        disabled={!hasNext || zoom > 1.05}
        className={`absolute top-1/2 -translate-y-1/2 z-30 right-2 sm:right-4 md:right-6 p-3 sm:p-3.5 rounded-full shadow-lg transition-all disabled:opacity-0 disabled:pointer-events-none ${arrowClass}`}
        aria-label="Next image"
      >
        <ChevronRight size={26} />
      </button>

      {/* Floating hint when zoomed in */}
      {zoom > 1.05 && (
        <div className="absolute bottom-16 sm:bottom-12 inset-x-0 flex justify-center pointer-events-none z-40">
          <button
            type="button"
            onClick={resetZoom}
            className="pointer-events-auto px-3.5 py-1.5 rounded-full text-xs font-semibold text-white/90 bg-black/70 backdrop-blur-md border border-white/15 shadow-xl hover:bg-black/90 active:scale-95 transition-all"
          >
            {zoomPct}% · Tap to zoom out
          </button>
        </div>
      )}

      {/* Caption bar */}
      {item.caption && (
        <div
          className="absolute bottom-0 inset-x-0 px-4 pt-8 pb-4 text-center z-30 pointer-events-none"
          style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
        >
          <p className="text-xs sm:text-sm font-telugu" style={{ fontFamily: 'Tiro Telugu, serif', color: captionColor }}>
            {item.caption}
          </p>
        </div>
      )}
    </div>
  );
}
