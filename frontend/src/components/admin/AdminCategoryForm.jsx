import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { GOLD_TEXT, COLOR_OPTIONS } from '../../constants/adminConstants';
import { MAIN_CATEGORIES } from '../../data/categories';
import { uploadSubcategoryImage } from '../../api/uploadApi';
import { mapAdminError } from '../../lib/apiError';

export default function AdminCategoryForm({ category, defaultParentKey, onSave, onClose, isSaving = false }) {
  const isEdit = !!category?.id;
  const initialParent = category?.parent_key || defaultParentKey || MAIN_CATEGORIES[0]?.key || 'stotra';
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(category?.image_url || null);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState(
    category || {
      parent_key: initialParent,
      filter_cat: initialParent,
      label: '',
      label_te: '',
      label_en: '',
      color: COLOR_OPTIONS[0].value,
      bg: 'bg-rose-700',
      text: 'text-rose-700',
      image_url: null,
    }
  );

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function handleParentChange(parentKey) {
    setForm((f) => ({
      ...f,
      parent_key: parentKey,
      filter_cat: parentKey,
    }));
  }

  function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.label.trim() || !form.label_en.trim()) return;

    let imageUrl = form.image_url || null;

    try {
      if (imageFile) {
        setUploading(true);
        const uploaded = await uploadSubcategoryImage(imageFile);
        imageUrl = uploaded.url;
      }
    } catch (err) {
      toast.error(mapAdminError(err));
      setUploading(false);
      return;
    }
    setUploading(false);

    const payload = {
      isEdit,
      parent_key: form.parent_key,
      filter_cat: form.filter_cat || form.parent_key,
      label: form.label.trim(),
      label_te: (form.label_te || form.label).trim(),
      label_en: form.label_en.trim(),
      search_terms: [],
      color: form.color,
      bg: form.bg,
      text: form.text,
      image_url: imageUrl,
    };
    if (isEdit) payload.id = form.id;
    onSave(payload);
  }

  const busy = isSaving || uploading;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto scrollbar-hide p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ scale: 1, opacity: 1 }}
        className="corner-card rounded-2xl w-full max-w-md shadow-2xl my-4 bg-card">

        <div className="flex items-center justify-between px-6 py-4 panel-header-bar">
          <h2 className="font-bold text-base gold-glow">
            {isEdit ? 'Edit Subcategory' : 'Add New Subcategory'}
          </h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg" style={{ color: GOLD_TEXT }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="form-label">Category *</label>
            <select
              value={form.parent_key}
              onChange={(e) => handleParentChange(e.target.value)}
              className="form-select"
            >
              {MAIN_CATEGORIES.map((item) => (
                <option key={item.key} value={item.key}>{item.en} — {item.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Subcategory Image</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-elevated flex items-center justify-center flex-shrink-0"
                style={{ border: '1px solid var(--border-subtle)' }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus size={22} className="text-muted" />
                )}
              </div>
              <div className="flex-1">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
                  className="text-xs font-semibold px-3 py-2 rounded-lg btn-ghost disabled:opacity-50">
                  {imagePreview ? 'Change image' : 'Upload image'}
                </button>
                {imagePreview && (
                  <button type="button" disabled={busy}
                    onClick={() => { setImageFile(null); setImagePreview(null); set('image_url', null); }}
                    className="block text-[11px] text-red-400 mt-1 hover:underline disabled:opacity-50">
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="form-label">Subcategory Name (Telugu) *</label>
            <input value={form.label} onChange={(e) => set('label', e.target.value)}
              placeholder="సుప్రభాతాలు" required className="form-input"
              style={{ fontFamily: 'Tiro Telugu, serif' }} />
          </div>

          <div>
            <label className="form-label">Subcategory Name (English) *</label>
            <input value={form.label_en} onChange={(e) => set('label_en', e.target.value)}
              placeholder="Suprabhatams" required className="form-input" />
          </div>

          <div>
            <label className="form-label mb-2">Color Theme</label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => set('color', opt.value)}
                  className={`h-9 rounded-xl bg-gradient-to-r ${opt.value} transition-all ${form.color === opt.value ? 'ring-2 ring-offset-2 ring-amber-400 scale-105' : 'opacity-70'}`}
                  title={opt.label} />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={busy}
              className="flex-1 py-3 rounded-xl text-sm font-semibold btn-ghost disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold btn-gold disabled:opacity-50">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {isEdit ? 'Save Changes' : 'Add Subcategory'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
