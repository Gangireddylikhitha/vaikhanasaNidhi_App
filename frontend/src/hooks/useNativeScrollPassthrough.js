import { useEffect, useRef } from 'react';
import { isNativeApp } from '../lib/native';

/**
 * On Capacitor/Android, horizontal rows can block parent vertical scroll.
 * Forward primarily-vertical gestures to the main scroll container.
 */
export function useNativeScrollPassthrough() {
  const ref = useRef(null);

  useEffect(() => {
    if (!isNativeApp()) return undefined;
    const row = ref.current;
    if (!row) return undefined;

    const main = row.closest('.app-main-scroll') || document.querySelector('.app-main-scroll');
    if (!main) return undefined;

    let startY = 0;
    let startX = 0;
    let axis = null;

    function onStart(e) {
      axis = null;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    }

    function onMove(e) {
      const y = e.touches[0].clientY;
      const x = e.touches[0].clientX;
      const dy = y - startY;
      const dx = x - startX;

      if (!axis) {
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.1) axis = 'y';
        else if (Math.abs(dx) > 10) axis = 'x';
      }

      if (axis === 'y') {
        main.scrollTop -= dy;
        startY = y;
        startX = x;
      }
    }

    row.addEventListener('touchstart', onStart, { passive: true });
    row.addEventListener('touchmove', onMove, { passive: true });
    return () => {
      row.removeEventListener('touchstart', onStart);
      row.removeEventListener('touchmove', onMove);
    };
  }, []);

  return ref;
}
