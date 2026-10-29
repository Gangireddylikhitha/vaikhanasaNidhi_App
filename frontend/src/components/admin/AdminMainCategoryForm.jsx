import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { GOLD_TEXT, COLOR_OPTIONS } from '../../constants/adminConstants';

export default function AdminMainCategoryForm({ category, onSave, onClose, isSaving = false }) {
  const [form, setForm] = useState({
    id: category.id,
    label: category.label_te || category.label || '',
    label_en: category.label_en || '',
    color: category.color || COLOR_OPTIONS[0].value,
    bg: category.bg || '',
    text: category.text || '',
  });

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.label.trim() || !form.label_en.trim()) return;
    onSave({
      isEdit: true,
      id: form.id,
      label: form.label.trim(),
      label_te: form.label.trim(),
      label_en: form.label_en.trim(),
      color: form.color,
      bg: form.bg,
      text: form.text,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto scrollbar-hide p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ scale: 1, opacity: 1 }}
        className="corner-card rounded-2xl w-full max-w-md shadow-2xl my-4 bg-card"
      >
        <div className="flex items-center justify-between px-6 py-4 panel-header-bar">
          <h2 className="font-bold text-base gold-glow">Edit Main Category</h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg" style={{ color: GOLD_TEXT }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">Slug</label>
            <input value={form.id} readOnly className="form-input opacity-60" />
          </div>

          <div>
            <label className="form-label">Name (Telugu) *</label>
            <input
              value={form.label}
              onChange={(e) => set('label', e.target.value)}
              required
              className="form-input"
              style={{ fontFamily: 'Tiro Telugu, serif' }}
            />
          </div>

          <div>
            <label className="form-label">Name (English) *</label>
            <input
              value={form.label_en}
              onChange={(e) => set('label_en', e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label mb-2">Color Theme</label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('color', opt.value)}
                  className={`h-9 rounded-xl bg-gradient-to-r ${opt.value} transition-all ${
                    form.color === opt.value ? 'ring-2 ring-offset-2 ring-amber-400 scale-105' : 'opacity-70'
                  }`}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions modal-actions--inline">
            <button type="button" onClick={onClose} disabled={isSaving}
              className="modal-btn btn-ghost disabled:opacity-50">
              <span className="modal-btn-label">Cancel</span>
            </button>
            <button type="submit" disabled={isSaving}
              className="modal-btn modal-btn-primary btn-gold disabled:opacity-50">
              {isSaving ? <Loader2 size={14} className="modal-btn-icon animate-spin" /> : <Save size={14} className="modal-btn-icon" />}
              <span className="modal-btn-label">Save</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
