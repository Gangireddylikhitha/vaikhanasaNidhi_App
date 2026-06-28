import { useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { GOLD_TEXT } from '../../constants/adminConstants';
import { MAIN_CATEGORIES } from '../../data/categories';
import SubcategoryCombobox from './SubcategoryCombobox';
import { uploadScriptureImages } from '../../api/uploadApi';
import { mapAdminError } from '../../lib/apiError';

const IMAGES_CATEGORY = 'chitralu';

function isImageGalleryCategory(parentKey) {
  return parentKey === IMAGES_CATEGORY;
}

export default function AdminScriptureForm({
  scripture,
  subcategories = [],
  onSave,
  onClose,
  onCreateSubcategory,
  isSaving = false,
  isCreatingSubcategory = false,
}) {
  const isEdit = !!scripture?.id;
  const defaultParent = scripture?.parent_category || MAIN_CATEGORIES[0]?.key || 'stotra';
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const initialGallery = isImageGalleryCategory(scripture?.parent_category);
  const [form, setForm] = useState(() => {
    if (scripture) {
      return {
        ...scripture,
        verse: scripture.verses?.[0] || { telugu: '', meaning: '' },
        images: scripture.images || [],
      };
    }
    return {
      title_telugu: '',
      title_english: '',
      parent_category: defaultParent,
      subcategory: '',
      category: defaultParent,
      description: '',
      verse: { telugu: '', meaning: '' },
      images: [],
    };
  });

  const [pendingFiles, setPendingFiles] = useState([]);

  const isGallery = isImageGalleryCategory(form.parent_category);

  const filteredSubs = useMemo(
    () => subcategories.filter((s) => s.parent_key === form.parent_category),
    [subcategories, form.parent_category]
  );

  const canSave = form.title_telugu.trim() && (isEdit || form.subcategory)
    && (!isGallery || form.images.length > 0 || pendingFiles.length > 0);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function handleParentChange(parentKey) {
    setForm((f) => ({
      ...f,
      parent_category: parentKey,
      subcategory: '',
      category: parentKey,
      verse: { telugu: '', meaning: '' },
      images: [],
    }));
    setPendingFiles([]);
  }

  function handleSubcategoryChange(subKey) {
    const sub = filteredSubs.find((s) => s.key === subKey);
    setForm((f) => ({
      ...f,
      subcategory: subKey,
      category: sub?.filter_cat || sub?.parent_key || f.parent_category,
    }));
  }

  async function handleCreateSubcategory({ label, label_en, label_te }) {
    const created = await onCreateSubcategory?.({
      parent_key: form.parent_category,
      filter_cat: form.parent_category,
      label,
      label_en,
      label_te,
    });
    if (created?.key) {
      setForm((f) => ({
        ...f,
        subcategory: created.key,
        category: created.filter_cat || created.parent_key || f.parent_category,
      }));
    }
  }

  function handleImagePick(e) {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    if (files.some((f) => !f.type.startsWith('image/'))) {
      toast.error('Please choose image files only.');
      return;
    }
    setPendingFiles((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        caption: '',
      })),
    ]);
    e.target.value = '';
  }

  function removeExistingImage(index) {
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== index),
    }));
  }

  function removePendingImage(id) {
    setPendingFiles((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  function setPendingCaption(id, caption) {
    setPendingFiles((prev) => prev.map((p) => (p.id === id ? { ...p, caption } : p)));
  }

  function setExistingCaption(index, caption) {
    setForm((f) => ({
      ...f,
      images: f.images.map((img, i) => (i === index ? { ...img, caption } : img)),
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!canSave) return;

    let images = (form.images || []).map(({ url, caption }) => ({
      url,
      caption: caption?.trim() || '',
    }));

    try {
      if (isGallery && pendingFiles.length) {
        setUploading(true);
        const uploaded = await uploadScriptureImages(pendingFiles.map((p) => p.file));
        const newImages = uploaded.images.map((url, i) => ({
          url,
          caption: pendingFiles[i]?.caption?.trim() || '',
        }));
        images = [...images, ...newImages];
      }
    } catch (err) {
      toast.error(mapAdminError(err));
      setUploading(false);
      return;
    }
    setUploading(false);

    const payload = {
      title_telugu: form.title_telugu.trim(),
      title_english: form.title_english?.trim() || '',
      parent_category: form.parent_category,
      subcategory: form.subcategory || '',
      category: form.category,
      description: form.description || '',
    };

    if (isGallery) {
      payload.images = images;
      payload.verses = [];
    } else {
      const verse = form.verse || { telugu: '', meaning: '' };
      payload.verses = (verse.telugu?.trim() || verse.meaning?.trim()) ? [verse] : [];
      payload.images = [];
    }

    if (isEdit) payload.id = form.id;
    onSave(payload);
  }

  const busy = isSaving || uploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="corner-card rounded-2xl w-full max-w-2xl shadow-2xl bg-card flex flex-col max-h-[min(92vh,720px)]"
      >
        <div className="flex items-center justify-between px-6 py-4 panel-header-bar flex-shrink-0">
          <h2 className="font-bold text-base gold-glow">
            {isEdit ? 'Edit Scripture' : 'Add New Scripture'}
          </h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/5" style={{ color: GOLD_TEXT }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Title (Telugu) *</label>
                <input value={form.title_telugu} onChange={(e) => set('title_telugu', e.target.value)}
                  placeholder={isGallery ? 'చిత్రాలు పేరు' : 'స్తోత్రం పేరు'} required className="form-input"
                  style={{ fontFamily: 'Tiro Telugu, serif' }} />
              </div>
              <div>
                <label className="form-label">Title (English)</label>
                <input value={form.title_english || ''} onChange={(e) => set('title_english', e.target.value)}
                  placeholder={isGallery ? 'Image album name' : 'Stotra Name'} className="form-input" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Category *</label>
                <select
                  value={form.parent_category}
                  onChange={(e) => handleParentChange(e.target.value)}
                  className="form-select"
                >
                  {MAIN_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{c.en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Subcategory {!isEdit && '*'}</label>
                <SubcategoryCombobox
                  subcategories={filteredSubs}
                  value={form.subcategory}
                  onChange={handleSubcategoryChange}
                  onCreateNew={handleCreateSubcategory}
                  isCreating={isCreatingSubcategory}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)}
                rows={2} placeholder="వివరణ..." className="form-textarea resize-none"
                style={{ fontFamily: 'Tiro Telugu, serif' }} />
            </div>

            {isGallery ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="form-label mb-0">Images *</label>
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg btn-ghost">
                    <ImagePlus size={12} /> Add images
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImagePick} />
                <p className="text-[11px] text-muted mb-3">
                  Upload photos for Images (చిత్రాలు). Subcategory thumbnails are set in Categories only.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {form.images.map((img, i) => (
                    <div key={img.url} className="rounded-xl overflow-hidden bg-elevated" style={{ border: '1px solid var(--border-subtle)' }}>
                      <div className="relative aspect-square">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeExistingImage(i)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input value={img.caption || ''} onChange={(e) => setExistingCaption(i, e.target.value)}
                        placeholder="Caption (optional)" className="w-full px-2 py-1.5 text-xs bg-transparent border-t border-[var(--border-subtle)] outline-none" />
                    </div>
                  ))}
                  {pendingFiles.map((item) => (
                    <div key={item.id} className="rounded-xl overflow-hidden bg-elevated" style={{ border: '1px solid var(--border-subtle)' }}>
                      <div className="relative aspect-square">
                        <img src={item.preview} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removePendingImage(item.id)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input value={item.caption} onChange={(e) => setPendingCaption(item.id, e.target.value)}
                        placeholder="Caption (optional)" className="w-full px-2 py-1.5 text-xs bg-transparent border-t border-[var(--border-subtle)] outline-none" />
                    </div>
                  ))}
                </div>
                {!form.images.length && !pendingFiles.length && (
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
                    className="w-full py-8 rounded-xl border border-dashed border-[var(--border-medium)] text-muted text-sm hover:bg-white/5 transition-colors">
                    <ImagePlus size={20} className="mx-auto mb-2 opacity-50" />
                    Tap to upload images
                  </button>
                )}
              </div>
            ) : (
              <div>
                <label className="form-label">Content</label>
                <div className="rounded-xl p-3 bg-elevated" style={{ border: '1px solid var(--border-subtle)' }}>
                  <textarea
                    value={form.verse?.telugu || ''}
                    onChange={(e) => setForm((f) => ({ ...f, verse: { ...f.verse, telugu: e.target.value } }))}
                    rows={4}
                    placeholder="తెలుగు పద్యం / మంత్రం..."
                    className="form-textarea resize-none mb-2"
                    style={{ fontFamily: 'Tiro Telugu, serif' }}
                  />
                  <textarea
                    value={form.verse?.meaning || ''}
                    onChange={(e) => setForm((f) => ({ ...f, verse: { ...f.verse, meaning: e.target.value } }))}
                    rows={3}
                    placeholder="Meaning / అర్థం..."
                    className="form-textarea resize-none"
                    style={{ fontFamily: 'Tiro Telugu, serif' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div
            className="flex-shrink-0 flex gap-3 px-6 py-4 border-t"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <button type="button" onClick={onClose} disabled={busy}
              className="flex-1 py-3 rounded-xl text-sm font-semibold btn-ghost disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={busy || !canSave}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold btn-gold disabled:opacity-50">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {isEdit ? 'Save Changes' : 'Add Scripture'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
