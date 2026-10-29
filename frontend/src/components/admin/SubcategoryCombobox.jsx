import { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, ChevronDown } from 'lucide-react';

export default function SubcategoryCombobox({
  subcategories = [],
  value,
  onChange,
  onCreateNew,
  disabled = false,
  isCreating = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTe, setNewTe] = useState('');
  const [newEn, setNewEn] = useState('');
  const [menuStyle, setMenuStyle] = useState({});
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selected = subcategories.find((s) => s.key === value || s.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subcategories;
    return subcategories.filter(
      (s) =>
        s.label_en?.toLowerCase().includes(q) ||
        s.label?.toLowerCase().includes(q) ||
        s.label_te?.includes(query.trim()) ||
        s.key?.includes(q)
    );
  }, [subcategories, query]);

  useEffect(() => {
    if (!open || !triggerRef.current) return undefined;

    function updatePosition() {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 10000,
      });
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    function onDocClick(e) {
      const t = e.target;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
      setShowCreate(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function pick(item) {
    onChange(item.key || item.id);
    setQuery('');
    setOpen(false);
    setShowCreate(false);
  }

  function handleCreate(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!newTe.trim() || !newEn.trim()) return;
    onCreateNew?.({ label: newTe.trim(), label_en: newEn.trim(), label_te: newTe.trim() });
    setNewTe('');
    setNewEn('');
    setShowCreate(false);
    setOpen(false);
  }

  const dropdown = open ? (
    <div
      ref={menuRef}
      style={menuStyle}
      className="rounded-xl shadow-2xl bg-card border border-[var(--border-subtle)] max-h-64 overflow-y-auto scrollbar-hide"
    >
      <div className="p-2 border-b border-[var(--border-subtle)] sticky top-0 bg-card">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search or type new name…"
          className="form-input text-sm"
          autoFocus
        />
      </div>

      {filtered.length === 0 && !showCreate && (
        <p className="px-3 py-2 text-xs text-muted">No match. Create new below.</p>
      )}

      {filtered.map((item) => (
        <button
          key={item.id || item.key}
          type="button"
          onClick={() => pick(item)}
          className="w-full text-left px-3 py-2.5 hover:bg-[var(--hover-bg)] transition-colors"
        >
          <p className="text-sm font-medium gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            {item.label_te || item.label}
          </p>
          <p className="text-xs text-muted">{item.label_en}</p>
        </button>
      ))}

      <div className="border-t border-[var(--border-subtle)] p-2">
        {!showCreate ? (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold btn-ghost rounded-lg"
          >
            <Plus size={14} /> Add new subcategory
          </button>
        ) : (
          <form onSubmit={handleCreate} className="space-y-2">
            <input
              value={newTe}
              onChange={(e) => setNewTe(e.target.value)}
              placeholder="Telugu name *"
              required
              className="form-input text-sm"
              style={{ fontFamily: 'Tiro Telugu, serif' }}
            />
            <input
              value={newEn}
              onChange={(e) => setNewEn(e.target.value)}
              placeholder="English name *"
              required
              className="form-input text-sm"
            />
            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-2 rounded-lg text-xs font-bold btn-gold disabled:opacity-50"
            >
              {isCreating ? 'Creating…' : 'Create & select'}
            </button>
          </form>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="form-select w-full text-left flex items-center justify-between gap-2 disabled:opacity-50"
      >
        <span className="truncate" style={{ fontFamily: selected ? 'Tiro Telugu, serif' : 'inherit' }}>
          {selected ? (selected.label_te || selected.label) : 'Select subcategory…'}
        </span>
        <ChevronDown size={16} className="text-muted flex-shrink-0" />
      </button>
      {typeof document !== 'undefined' && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  );
}
