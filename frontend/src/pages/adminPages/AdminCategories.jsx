import { useMemo, useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import AdminCategoryForm from '../../components/admin/AdminCategoryForm';
import AdminMainCategoryForm from '../../components/admin/AdminMainCategoryForm';
import AdminPageState from '../../components/admin/AdminPageState';
import {
  useCategories,
  useSaveCategory,
  useSubcategories,
  useSaveSubcategory,
  useDeleteSubcategory,
} from '../../hooks/useCategories';
import { useScriptures } from '../../hooks/useScriptures';
import { mergeSubcategories } from '../../utils/mergeSubcategories';
import { countScripturesForSubcategory, countScripturesForMainSection } from '../../utils/scriptureSubcategoryMatch';
import { getApiError, mapAdminError } from '../../lib/apiError';

export default function AdminCategories() {
  const {
    data: mainCategories = [],
    isLoading: mainLoading,
    isError: mainError,
    error: mainErr,
    refetch: refetchMain,
  } = useCategories();

  const [selectedParent, setSelectedParent] = useState('');

  useEffect(() => {
    if (!selectedParent && mainCategories.length) {
      setSelectedParent(mainCategories[0].key || mainCategories[0].id);
    }
  }, [mainCategories, selectedParent]);

  const {
    data: subcategories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErr,
    refetch: refetchCategories,
  } = useSubcategories();

  const {
    data: scriptures = [],
    isLoading: scripturesLoading,
    isError: scripturesError,
    error: scripturesErr,
    refetch: refetchScriptures,
  } = useScriptures();

  const saveMainMutation = useSaveCategory();
  const saveMutation = useSaveSubcategory();
  const deleteMutation = useDeleteSubcategory();

  const [mainModal, setMainModal] = useState(null);
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const isLoading = mainLoading || categoriesLoading || scripturesLoading;
  const isError = mainError || categoriesError || scripturesError;
  const errorMessage = getApiError(mainErr || categoriesErr || scripturesErr);

  const allSubs = useMemo(() => mergeSubcategories(subcategories), [subcategories]);

  const filteredSubs = useMemo(
    () => mergeSubcategories(subcategories, selectedParent),
    [subcategories, selectedParent]
  );

  const selectedMain = mainCategories.find((c) => (c.key || c.id) === selectedParent);

  function handleRetry() {
    refetchMain();
    refetchCategories();
    refetchScriptures();
  }

  function handleSaveMain(form) {
    saveMainMutation.mutate(form, {
      onSuccess: () => {
        setMainModal(null);
        toast.success('Main category updated.');
      },
      onError: (err) => toast.error(mapAdminError(err)),
    });
  }

  function handleSave(form) {
    saveMutation.mutate(form, {
      onSuccess: () => {
        setModal(null);
        toast.success(form.isEdit ? 'Subcategory updated.' : 'Subcategory added.');
      },
      onError: (err) => toast.error(mapAdminError(err)),
    });
  }

  function handleDelete(id) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setConfirmDelete(null);
        toast.success('Subcategory deleted.');
      },
      onError: (err) => toast.error(mapAdminError(err)),
    });
  }

  const isMutating = saveMainMutation.isPending || saveMutation.isPending || deleteMutation.isPending;

  return (
    <AdminPageState
      isLoading={isLoading}
      isError={isError}
      error={errorMessage}
      onRetry={handleRetry}
    >
      <div className="space-y-4">
        <section className="corner-card rounded-xl overflow-hidden">
          <div className="px-4 py-3 panel-header-bar flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold gold-glow">Main Categories</h2>
              <p className="text-[11px] text-muted">Names shown on home and category pages</p>
            </div>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {mainCategories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                <div className={`w-1 h-10 rounded-full bg-gradient-to-b ${cat.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium gold-glow truncate" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                    {cat.label_te || cat.label}
                  </p>
                  <p className="text-[11px] text-muted truncate">{cat.label_en}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMainModal(cat)}
                  disabled={isMutating}
                  className="p-1.5 rounded-md text-muted hover:text-[#E4B24B] hover:bg-white/5 transition-colors disabled:opacity-50"
                  title="Edit main category"
                >
                  <Pencil size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="corner-card rounded-xl px-2 py-2 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 min-w-max">
              {mainCategories.map((cat) => {
                const key = cat.key || cat.id;
                const subCount = allSubs.filter((s) => s.parent_key === key).length;
                const scriptureCount = countScripturesForMainSection(scriptures, key, allSubs);
                const active = selectedParent === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedParent(key)}
                    title={`${subCount} subcategories`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      active ? 'btn-gold' : 'btn-ghost'
                    }`}
                  >
                    <span style={{ fontFamily: 'Tiro Telugu, serif' }}>{cat.label_te || cat.label}</span>
                    <span className="ml-1 opacity-60">({scriptureCount})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-0.5">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold gold-glow truncate">{selectedMain?.label_en || 'Subcategories'}</h2>
              <p className="text-[11px] text-muted">{filteredSubs.length} subcategories</p>
            </div>
            <button
              type="button"
              onClick={() => setModal('add')}
              disabled={isMutating || !selectedParent}
              className="admin-chip-btn btn-gold disabled:opacity-50"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          </div>

          {filteredSubs.length === 0 ? (
            <div className="corner-card rounded-xl py-10 text-center text-muted">
              <p className="text-xs">No subcategories yet.</p>
            </div>
          ) : (
            <div className="corner-card rounded-xl overflow-hidden divide-y divide-[var(--border-subtle)] max-h-[calc(100vh-22rem)] overflow-y-auto scrollbar-hide">
              {filteredSubs.map((cat) => {
                const count = countScripturesForSubcategory(scriptures, cat);
                return (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className={`w-1 self-stretch rounded-full bg-gradient-to-b ${cat.color} flex-shrink-0`} />

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium gold-glow truncate leading-tight"
                        style={{ fontFamily: 'Tiro Telugu, serif' }}
                      >
                        {cat.label_te || cat.label}
                      </p>
                      <p className="text-[11px] text-muted truncate">{cat.label_en}</p>
                    </div>

                    <span className="text-[11px] tabular-nums text-muted flex-shrink-0 w-12 text-right">
                      {count}
                    </span>

                    {!cat.isBuiltin && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setModal(cat)}
                          disabled={isMutating}
                          title="Edit"
                          className="p-1.5 rounded-md text-muted hover:text-[#E4B24B] hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(cat.id)}
                          disabled={isMutating}
                          title="Delete"
                          className="p-1.5 rounded-md text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {mainModal && (
          <AdminMainCategoryForm
            category={mainModal}
            onSave={handleSaveMain}
            onClose={() => setMainModal(null)}
            isSaving={saveMainMutation.isPending}
          />
        )}
        {modal && (
          <AdminCategoryForm
            category={modal === 'add' ? null : modal}
            defaultParentKey={selectedParent}
            mainCategories={mainCategories}
            onSave={handleSave}
            onClose={() => setModal(null)}
            isSaving={saveMutation.isPending}
          />
        )}
        {confirmDelete && (
          <AdminConfirmDialog
            message="Delete this subcategory? Scriptures in it won't be deleted."
            onYes={() => handleDelete(confirmDelete)}
            onNo={() => setConfirmDelete(null)}
            isLoading={deleteMutation.isPending}
          />
        )}
      </div>
    </AdminPageState>
  );
}
