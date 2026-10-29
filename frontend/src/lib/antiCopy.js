/**
 * Anti-Copy & Text Protection Module
 * Restricts user text copying, dragging, and context menus for non-input content.
 */

function isInputField(el) {
  if (!el) return false;
  const tag = el.tagName ? el.tagName.toLowerCase() : '';
  return tag === 'input' || tag === 'textarea' || el.isContentEditable;
}

export function initAntiCopy() {
  if (typeof document === 'undefined') return;

  // Prevent copying text from scriptures / UI
  document.addEventListener(
    'copy',
    (e) => {
      if (!isInputField(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  // Prevent cut from non-input elements
  document.addEventListener(
    'cut',
    (e) => {
      if (!isInputField(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  // Prevent text / image drag selection
  document.addEventListener(
    'dragstart',
    (e) => {
      if (!isInputField(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  // Prevent text selection initiation
  document.addEventListener(
    'selectstart',
    (e) => {
      if (!isInputField(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  // Prevent long-press / context menu
  document.addEventListener(
    'contextmenu',
    (e) => {
      if (!isInputField(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );
}
