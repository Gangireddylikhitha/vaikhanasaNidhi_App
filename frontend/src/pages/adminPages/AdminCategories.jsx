import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import AdminCategoryForm from '../../components/admin/AdminCategoryForm';
import AdminPageState from '../../components/admin/AdminPageState';
import { useSubcategories, useSaveSubcategory, useDeleteSubcategory } from '../../hooks/useCategories';
import { useScriptures } from '../../hooks/useScriptures';
import { MAIN_CATEGORIES } from '../../data/categories';
import { mergeSubcategories } from '../../utils/mergeSubcategories';
import { countScripturesForSubcategory, countScripturesForMainSection } from '../../utils/scriptureSubcategoryMatch';
import { getApiError, mapAdminError } from '../../lib/apiError';

export default function AdminCategories() {
  const [selectedParent, setSelectedParent] = useState(MAIN_CATEGORIES[0]?.key || 'stotra');

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

  const saveMutation = useSaveSubcategory();
  const deleteMutation = useDeleteSubcategory();

  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const isLoading = categoriesLoading || scripturesLoading;
  const isError = categoriesError || scripturesError;
  const errorMessage = getApiError(categoriesErr || scripturesErr);

  const allSubs = useMemo(() => mergeSubcategories(subcategories), [subcategories]);

  const filteredSubs = useMemo(
    () => mergeSubcategories(subcategories, selectedParent),
    [subcategories, selectedParent]
  );

  const selectedMain = MAIN_CATEGORIES.find((c) => c.key === selectedParent);

  function handleRetry() {
    refetchCategories();
    refetchScriptures();
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

  const isMutating = saveMutation.isPending || deleteMutation.isPending;

  return (
    <AdminPageState
      isLoading={isLoading}
      isError={isError}
      error={errorMessage}
      onRetry={handleRetry}
    >
      <div className="space-y-3">
        {/* Category tabs — compact pills */}
        <div className="corner-card rounded-xl px-2 py-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 min-w-max">
            {MAIN_CATEGORIES.map((cat) => {
              const subCount = allSubs.filter((s) => s.parent_key === cat.key).length;
              const scriptureCount = countScripturesForMainSection(scriptures, cat.key, allSubs);
              const active = selectedParent === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedParent(cat.key)}
                  title={`${subCount} subcategories`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    active ? 'btn-gold' : 'btn-ghost'
                  }`}
                >
                  <span style={{ fontFamily: 'Tiro Telugu, serif' }}>{cat.label}</span>
                  <span className="ml-1 opacity-60">({scriptureCount})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between gap-2 px-0.5">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold gold-glow truncate">{selectedMain?.en}</h2>
            <p className="text-[11px] text-muted">{filteredSubs.length} subcategories</p>
          </div>
          <button
            type="button"
            onClick={() => setModal('add')}
            disabled={isMutating}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold btn-gold disabled:opacity-50 flex-shrink-0"
          >
            <Plus size={13} /> Add
          </button>
        </div>

        {/* Subcategory list */}
        {filteredSubs.length === 0 ? (
          <div className="corner-card rounded-xl py-10 text-center text-muted">
            <p className="text-xs">No subcategories yet.</p>
          </div>
        ) : (
          <div className="corner-card rounded-xl overflow-hidden divide-y divide-[var(--border-subtle)] max-h-[calc(100vh-14rem)] overflow-y-auto scrollbar-hide">
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

        {modal && (
          <AdminCategoryForm
            category={modal === 'add' ? null : modal}
            defaultParentKey={selectedParent}
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
