import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import AdminScriptureForm from '../../components/admin/AdminScriptureForm';
import AdminPageState from '../../components/admin/AdminPageState';
import { GOLD_TEXT } from '../../constants/adminConstants';
import { MAIN_CATEGORIES } from '../../data/categories';
import { useScriptures, useSaveScripture, useDeleteScripture } from '../../hooks/useScriptures';
import { useSubcategories, useSaveSubcategory } from '../../hooks/useCategories';
import { getApiError, mapAdminError } from '../../lib/apiError';
import { mergeSubcategories } from '../../utils/mergeSubcategories';
import {
  scriptureMatchesSubcategory,
  getScriptureSubcategoryKey,
  resolveScriptureParentKey,
  resolveScriptureSubForDisplay,
} from '../../utils/scriptureSubcategoryMatch';
import { invalidateAdminQueries } from '../../hooks/adminQueryKeys';
import * as categoryApi from '../../api/categoryApi';

export default function AdminScriptures() {
  const queryClient = useQueryClient();
  const {
    data: scriptures = [],
    isLoading: scripturesLoading,
    isError: scripturesError,
    error: scripturesErr,
    refetch: refetchScriptures,
  } = useScriptures();

  const {
    data: subcategories = [],
    isLoading: subcategoriesLoading,
    isError: subcategoriesError,
    error: subcategoriesErr,
    refetch: refetchSubcategories,
  } = useSubcategories();

  const saveMutation = useSaveScripture();
  const saveSubcategoryMutation = useSaveSubcategory();
  const deleteMutation = useDeleteScripture();

  const [search, setSearch] = useState('');
  const [filterParent, setFilterParent] = useState('all');
  const [filterSub, setFilterSub] = useState('all');
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const isLoading = scripturesLoading || subcategoriesLoading;
  const isError = scripturesError || subcategoriesError;
  const errorMessage = getApiError(scripturesErr || subcategoriesErr);

  const allSubs = useMemo(() => mergeSubcategories(subcategories), [subcategories]);

  const totalVerses = useMemo(
    () => scriptures.reduce((sum, s) => {
      const imageCount = s.images?.length || 0;
      if (s.parent_category === 'chitralu' || imageCount) return sum + imageCount;
      return sum + (s.verses?.length || 0);
    }, 0),
    [scriptures],
  );

  function contentCount(s) {
    const imageCount = s.images?.length || 0;
    if (s.parent_category === 'chitralu' || imageCount) return imageCount;
    return s.verses?.length || 0;
  }

  const subsForFilter = filterParent === 'all'
    ? allSubs
    : mergeSubcategories(subcategories, filterParent);

  const filtered = scriptures.filter((s) => {
    const matchParent = filterParent === 'all' || s.parent_category === filterParent || s.category === filterParent;
    const matchSub = filterSub === 'all' || (() => {
      const sub = allSubs.find((c) => c.key === filterSub);
      return sub ? scriptureMatchesSubcategory(s, sub) : s.subcategory === filterSub;
    })();
    const q = search.toLowerCase();
    const matchQ = !q || s.title_telugu.includes(q) || s.title_english?.toLowerCase().includes(q);
    return matchParent && matchSub && matchQ;
  });

  function handleRetry() {
    refetchScriptures();
    refetchSubcategories();
  }

  function handleSave(form) {
    saveMutation.mutate(form, {
      onSuccess: () => {
        setModal(null);
        toast.success(form.id ? 'Scripture updated.' : 'Scripture added.');
      },
      onError: (err) => toast.error(mapAdminError(err)),
    });
  }

  async function handleCreateSubcategory(payload) {
    const created = await categoryApi.createSubcategory(payload);
    await refetchSubcategories();
    invalidateAdminQueries(queryClient);
    toast.success('Subcategory created.');
    return created;
  }

  function handleDelete(id) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setConfirmDelete(null);
        toast.success('Scripture deleted.');
      },
      onError: (err) => toast.error(mapAdminError(err)),
    });
  }

  function subLabel(s) {
    const sub = resolveScriptureSubForDisplay(s, allSubs);
    return sub?.label_te || sub?.label || '—';
  }

  function parentLabel(s) {
    const key = resolveScriptureParentKey(s);
    return MAIN_CATEGORIES.find((c) => c.key === key)?.en || key || '—';
  }

  function enrichForForm(s) {
    if (!s || s === 'add') return s;
    const parent =
      s.parent_category
      || allSubs.find((c) => c.key === s.subcategory)?.parent_key
      || MAIN_CATEGORIES.find((m) => m.key === s.category)?.key
      || s.category
      || MAIN_CATEGORIES[0]?.key;
    const subKey = s.subcategory || getScriptureSubcategoryKey(s, parent) || '';
    const sub = allSubs.find((c) => c.key === subKey && c.parent_key === parent)
      || allSubs.find((c) => c.key === subKey);
    return {
      ...s,
      parent_category: parent,
      subcategory: subKey,
      category: sub?.filter_cat || s.category || parent,
      images: s.images?.length ? [...s.images] : [],
      verses: s.verses?.length ? [...s.verses] : [{ telugu: '', meaning: '' }],
    };
  }

  const isMutating = saveMutation.isPending || deleteMutation.isPending;

  return (
    <AdminPageState
      isLoading={isLoading}
      isError={isError}
      error={errorMessage}
      onRetry={handleRetry}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scriptures..." className="form-input pl-9" />
          </div>
          <select
            value={filterParent}
            onChange={(e) => { setFilterParent(e.target.value); setFilterSub('all'); }}
            className="form-select"
          >
            <option value="all">All Categories</option>
            {MAIN_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.en}</option>)}
          </select>
          <select value={filterSub} onChange={(e) => setFilterSub(e.target.value)} className="form-select">
            <option value="all">All Subcategories</option>
            {subsForFilter.map((c) => (
              <option key={c.id} value={c.key}>{c.label_en || c.label}</option>
            ))}
          </select>
          <button type="button" onClick={() => setModal('add')} disabled={isMutating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap btn-gold disabled:opacity-50">
            <Plus size={15} /> Add Scripture
          </button>
        </div>

        <div className="corner-card rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{scriptures.length === 0 ? 'No scriptures yet' : 'No scriptures found'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-elevated" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide hidden lg:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide hidden lg:table-cell">Subcategory</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide hidden sm:table-cell">Count</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const sub = resolveScriptureSubForDisplay(s, allSubs);
                    return (
                      <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-white/5 transition-colors"
                        style={{ borderTop: '1px solid #C88F2D15' }}>
                        <td className="px-4 py-3">
                          <div className="font-semibold gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                            {s.title_telugu}
                          </div>
                          <div className="text-xs text-muted">{s.title_english}</div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 lg:hidden">
                            <span className="text-[11px] text-muted">{parentLabel(s)}</span>
                            {sub ? (
                              <AdminBadge label={sub.label_te || sub.label} color={sub.color} />
                            ) : (
                              <span className="text-[11px] text-muted">{subLabel(s)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-muted">{parentLabel(s)}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {sub
                            ? <AdminBadge label={sub.label_te || sub.label} color={sub.color} />
                            : <span className="text-xs text-muted">{subLabel(s)}</span>}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-xs tabular-nums text-muted">{contentCount(s)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button type="button" onClick={() => setModal(s)} disabled={isMutating}
                              className="p-2 rounded-lg transition-colors hover:bg-white/5 disabled:opacity-50"
                              style={{ color: GOLD_TEXT }}>
                              <Pencil size={14} />
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(s.id)} disabled={isMutating}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-muted">
          {filtered.length} of {scriptures.length} scriptures
          {scriptures.length > 0 ? ` · ${totalVerses} items total` : ''}
        </p>

        {modal && (
          <AdminScriptureForm
            scripture={modal === 'add' ? null : enrichForForm(modal)}
            subcategories={allSubs}
            onSave={handleSave}
            onClose={() => setModal(null)}
            onCreateSubcategory={handleCreateSubcategory}
            isSaving={saveMutation.isPending}
            isCreatingSubcategory={saveSubcategoryMutation.isPending}
          />
        )}
        {confirmDelete && (
          <AdminConfirmDialog
            message="Delete this scripture? This cannot be undone."
            onYes={() => handleDelete(confirmDelete)}
            onNo={() => setConfirmDelete(null)}
            isLoading={deleteMutation.isPending}
          />
        )}
      </div>
    </AdminPageState>
  );
}
