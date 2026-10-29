/**
 * Android hardware / gesture back for Capacitor SPAs.
 * Do NOT rely on Capacitor canGoBack or window.history.back() alone —
 * those often exit the Activity on the first back press.
 */

/** @type {Array<() => boolean>} */
const overlayHandlers = [];

/** @type {null | (() => boolean)} */
let appBackHandler = null;

export function pushNativeBackHandler(handler) {
  overlayHandlers.push(handler);
  return () => {
    const idx = overlayHandlers.lastIndexOf(handler);
    if (idx >= 0) overlayHandlers.splice(idx, 1);
  };
}

/** Register the active shell back action (user router or admin tabs). */
export function setAppBackHandler(handler) {
  appBackHandler = handler;
  return () => {
    if (appBackHandler === handler) appBackHandler = null;
  };
}

/**
 * @returns {true} if back was consumed
 * @returns {false} if the app should exit
 */
export function handleNativeBack() {
  for (let i = overlayHandlers.length - 1; i >= 0; i -= 1) {
    try {
      if (overlayHandlers[i]()) return true;
    } catch {
      // ignore
    }
  }

  if (appBackHandler) {
    try {
      if (appBackHandler()) return true;
    } catch {
      // ignore
    }
  }

  return false;
}
