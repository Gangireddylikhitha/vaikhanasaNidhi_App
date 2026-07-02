import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Images, Plus, Pencil, Trash2, Search, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import AdminScriptureForm from '../../components/admin/AdminScriptureForm';
import AdminCategoryForm from '../../components/admin/AdminCategoryForm';
import AdminPageState from '../../components/admin/AdminPageState';
import { CHITRALU_CATEGORY, GOLD_TEXT } from '../../constants/adminConstants';
import {
  useAdminChitraluAlbums,
  useSaveScripture,
  useDeleteScripture,
  useSaveSubcategory,
  useDeleteSubcategory,
} from '../../hooks/useAdminGallery';
import { useCategories } from '../../hooks/useCategories';
import { getApiError, mapAdminError } from '../../lib/apiError';
import { invalidateAdminQueries } from '../../hooks/adminQueryKeys';
import * as categoryApi from '../../api/categoryApi';
import {
  getScriptureSubcategoryKey,
  resolveScriptureSubForDisplay,
} from '../../utils/scriptureSubcategoryMatch';

export default function AdminGallery() {
  const queryClient = useQueryClient();
  const {
    albums,
    chitraluSubs,
    totalPhotos,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminChitraluAlbums();

  const {
    data: mainCategories = [],
    isLoading: mainLoading,
    isError: mainError,
    error: mainErr,
    refetch: refetchMain,
  } = useCategories();

  const saveMutation = useSaveScripture();
  const deleteMutation = useDeleteScripture();
  const saveSubMutation = useSaveSubcategory();
  const deleteSubMutation = useDeleteSubcategory();

  const [search, setSearch] = useState('');
  const [filterSub, setFilterSub] = useState('all');
  const [albumModal, setAlbumModal] = useState(null);
  const [subModal, setSubModal] = useState(null);
  const [confirmDeleteAlbum, setConfirmDeleteAlbum] = useState(null);
  const [confirmDeleteSub, setConfirmDeleteSub] = useState(null);

  const chitraluMain = mainCategories.find((c) => (c.key || c.id) === CHITRALU_CATEGORY);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return albums.filter((a) => {
      const matchSub = filterSub === 'all' || a.subcategory === filterSub;
      const matchQ = !q
        || a.title_telugu?.includes(search.trim())
        || a.title_english?.toLowerCase().includes(q);
      return matchSub && matchQ;
    });
  }, [albums, filterSub, search]);

  function handleRetry() {
    refetch();
    refetchMain();
  }

  function enrichAlbumForForm(album) {
    if (!album || album === 'add') return album;
    const parent = CHITRALU_CATEGORY;
    const subKey = album.subcategory || getScriptureSubcategoryKey(album, parent) || '';
    const sub = chitraluSubs.find((c) => c.key === subKey);
    return {
      ...album,
      parent_category: parent,
      subcategory: subKey,
      category: sub?.filter_cat || parent,
      images: album.images?.length ? [...album.images] : [],
      verses: [],
    };
  }

  function handleSaveAlbum(form) {
    saveMutation.mutate(form, {
      onSuccess: () => {
        setAlbumModal(null);
        toast.success(form.id ? 'Album updated — visible on public gallery.' : 'Album added — visible on public gallery.');
      },
      onError: (err) => toast.error(mapAdminError(err)),
    });
  }

  async function handleCreateSubcategory(payload) {
    const created = await categoryApi.createSubcategory({
      ...payload,
      parent_key: CHITRALU_CATEGORY,
      filter_cat: CHITRALU_CATEGORY,
    });
    await refetch();
    invalidateAdminQueries(queryClient);
    toast.success('Subcategory created.');
    return created;
  }

  function handleSaveSub(form) {
    saveSubMutation.mutate({ ...form, parent_key: CHITRALU_CATEGORY, filter_cat: CHITRALU_CATEGORY }, {
      onSuccess: () => {
        setSubModal(null);
        toast.success(form.id ? 'Subcategory updated.' : 'Subcategory added.');
      },
      onError: (err) => toast.error(mapAdminError(err)),
    });
  }

  function handleDeleteAlbum(id) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setConfirmDeleteAlbum(null);
        toast.success('Album deleted.');
      },
      onError: (err) => toast.error(mapAdminError(err)),
    });
  }

  function handleDeleteSub(id) {
    deleteSubMutation.mutate(id, {
      onSuccess: () => {
        setConfirmDeleteSub(null);
        toast.success('Subcategory deleted.');
      },
      onError: (err) => toast.error(mapAdminError(err)),
    });
  }

  const isMutating = saveMutation.isPending || deleteMutation.isPending
    || saveSubMutation.isPending || deleteSubMutation.isPending;

  return (
    <AdminPageState
      isLoading={isLoading || mainLoading}
      isError={isError || mainError}
      error={getApiError(error || mainErr)}
      onRetry={handleRetry}
    >
      <div className="space-y-6">
        <div className="corner-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-elevated" style={{ border: '1px solid var(--border-subtle)' }}>
              <Images size={22} style={{ color: GOLD_TEXT }} />
            </div>
            <div>
              <h2 className="font-bold text-base gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                చిత్రాలు · Public Gallery
              </h2>
              <p className="text-[11px] text-muted mt-0.5">
                Albums here appear on the public /gallery page and Categories → Chitralu
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-lg font-bold tabular-nums gold-glow">{albums.length}</p>
              <p className="text-[10px] text-muted uppercase tracking-wide">Albums</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums gold-glow">{totalPhotos}</p>
              <p className="text-[10px] text-muted uppercase tracking-wide">Photos</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums gold-glow">{chitraluSubs.length}</p>
              <p className="text-[10px] text-muted uppercase tracking-wide">Sections</p>
            </div>
          </div>
        </div>

        <div className="corner-card rounded-2xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold gold-glow min-w-0 flex-1">Gallery Sections (Subcategories)</h3>
            <button type="button" onClick={() => setSubModal('add')} disabled={isMutating}
              className="admin-chip-btn btn-ghost">
              <FolderPlus size={13} />
              <span>Add section</span>
            </button>
          </div>
          {chitraluSubs.length === 0 ? (
            <p className="text-xs text-muted py-2">No sections yet — add one before creating albums.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {chitraluSubs.map((sub) => (
                <div key={sub.id || sub.key} className="admin-section-chip bg-elevated">
                  <div className="admin-badge-wrap">
                    <AdminBadge label={sub.label_te || sub.label} color={sub.color} />
                  </div>
                  <button type="button" onClick={() => setSubModal(sub)} disabled={isMutating}
                    className="admin-icon-btn hover:bg-white/5" style={{ color: GOLD_TEXT }}
                    aria-label="Edit section">
                    <Pencil size={12} />
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteSub(sub.id)} disabled={isMutating}
                    className="admin-icon-btn text-red-400 hover:bg-red-500/10"
                    aria-label="Delete section">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search albums..." className="form-input pl-9" />
          </div>
          <select value={filterSub} onChange={(e) => setFilterSub(e.target.value)} className="form-select">
            <option value="all">All sections</option>
            {chitraluSubs.map((c) => (
              <option key={c.id || c.key} value={c.key}>{c.label_en || c.label}</option>
            ))}
          </select>
          <button type="button" onClick={() => setAlbumModal('add')} disabled={isMutating}
            className="admin-chip-btn btn-gold disabled:opacity-50 w-full sm:w-auto justify-center">
            <Plus size={13} />
            <span>Add Album</span>
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="corner-card rounded-2xl text-center py-16 text-muted">
            <Images size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{albums.length === 0 ? 'No photo albums yet' : 'No albums match your filters'}</p>
            <button type="button" onClick={() => setAlbumModal('add')}
              className="mt-4 text-xs font-semibold btn-ghost px-4 py-2 rounded-lg inline-flex items-center gap-1">
              <Plus size={13} /> Create first album
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((album, i) => {
              const sub = resolveScriptureSubForDisplay(album, chitraluSubs);
              const cover = album.images?.[0]?.url;
              const count = album.images?.length || 0;
              return (
                <motion.div key={album.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="corner-card rounded-2xl overflow-hidden group"
                  style={{ border: '1px solid var(--border-subtle)' }}>
                  <div className="relative aspect-[4/3] bg-elevated">
                    {cover ? (
                      <img src={cover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Images size={28} className="opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button type="button" onClick={() => setAlbumModal(album)} disabled={isMutating}
                        className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70">
                        <Pencil size={16} />
                      </button>
                      <button type="button" onClick={() => setConfirmDeleteAlbum(album.id)} disabled={isMutating}
                        className="p-2 rounded-lg bg-black/50 text-red-300 hover:bg-black/70">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white">
                      {count} {count === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm gold-glow truncate" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                      {album.title_telugu}
                    </p>
                    <p className="text-[11px] text-muted truncate">{album.title_english}</p>
                    {sub && (
                      <div className="mt-2">
                        <AdminBadge label={sub.label_te || sub.label} color={sub.color} />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted">
          {filtered.length} of {albums.length} albums · {totalPhotos} photos total
          {chitraluMain ? ` · ${chitraluMain.label_te || chitraluMain.label}` : ''}
        </p>

        {albumModal && (
          <AdminScriptureForm
            scripture={albumModal === 'add' ? null : enrichAlbumForForm(albumModal)}
            subcategories={chitraluSubs}
            mainCategories={mainCategories}
            onSave={handleSaveAlbum}
            onClose={() => setAlbumModal(null)}
            onCreateSubcategory={handleCreateSubcategory}
            isSaving={saveMutation.isPending}
            isCreatingSubcategory={saveSubMutation.isPending}
            lockParentCategory={CHITRALU_CATEGORY}
            galleryMode
          />
        )}

        {subModal && (
          <AdminCategoryForm
            category={subModal === 'add' ? null : subModal}
            defaultParentKey={CHITRALU_CATEGORY}
            mainCategories={mainCategories.filter((c) => (c.key || c.id) === CHITRALU_CATEGORY)}
            onSave={handleSaveSub}
            onClose={() => setSubModal(null)}
            isSaving={saveSubMutation.isPending}
          />
        )}

        {confirmDeleteAlbum && (
          <AdminConfirmDialog
            message="Delete this album and all its photos? This cannot be undone."
            onYes={() => handleDeleteAlbum(confirmDeleteAlbum)}
            onNo={() => setConfirmDeleteAlbum(null)}
            isLoading={deleteMutation.isPending}
          />
        )}

        {confirmDeleteSub && (
          <AdminConfirmDialog
            message="Delete this gallery section? Albums in it may need reassignment."
            onYes={() => handleDeleteSub(confirmDeleteSub)}
            onNo={() => setConfirmDeleteSub(null)}
            isLoading={deleteSubMutation.isPending}
          />
        )}
      </div>
    </AdminPageState>
  );
}
