import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useMutation, keepPreviousData } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Search, X, TrendingUp, Hash, LayoutGrid, List, BookOpen, ChevronLeft, GripVertical } from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ScriptureCard from "../components/ScriptureCard";
import { ScriptureLoadingState, ScriptureErrorState } from "../components/ScriptureLoadingState";
import { usePublicScriptures } from "../hooks/usePublicScriptures";
import { usePublicSubcategories } from "../hooks/usePublicSubcategories";
import { usePublicCategories } from "../hooks/usePublicCategories";
import { isAdmin } from "../store/authStore";
import * as scriptureApi from "../api/scriptureApi";
import {
  getSubcategories,
  resolveBrowseParentKey,
} from "../data/categories";
import { findMainCategory } from "../utils/categoryLookup";
import { getScriptureBadgeLabel } from "../utils/scriptureSubcategoryMatch";

function SortableResultItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : "auto",
    position: "relative",
  };
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button type="button" {...attributes} {...listeners}
        className="absolute -left-1.5 -top-1.5 z-10 p-1 rounded-full shadow-md text-black cursor-grab active:cursor-grabbing touch-none"
        style={{ background: "#E4B24B" }}
        aria-label="Drag to reorder">
        <GripVertical size={12} />
      </button>
      {children}
    </div>
  );
}

const GOLD = "#E4B24B";
const GOLD_SOLID = "#C88F2D";
const TRENDING = ["Venkateswara", "Gayatri", "Lakshmi", "Suprabhatam", "Sahasranama", "Mantra", "Narasimha", "Hayagriva"];
const EMPTY_SCRIPTURES = [];

function mergePublicSubcategories(parentKey, dynamicSubs = []) {
  const staticSubs = getSubcategories(parentKey);
  const mappedDynamic = dynamicSubs.map((item) => ({
    key: item.key || item.id,
    label: item.label_en || item.label,
    labelTe: item.label_te || item.label,
    filterCat: item.filter_cat || item.parent_key || parentKey,
    searchTerms: item.search_terms || [],
    img: item.image_url || null,
  }));
  const byKey = new Map(staticSubs.map((item) => [item.key, item]));
  mappedDynamic.forEach((item) => byKey.set(item.key, item));
  return [...byKey.values()];
}

function ScriptureRow({ scripture, parentKey, subcategories, mainCategories }) {
  const badge = getScriptureBadgeLabel(scripture, parentKey, subcategories, mainCategories);

  return (
    <Link to={"/read/" + scripture.id}
      className="corner-card rounded-2xl flex items-center gap-3 p-3 active:brightness-110 transition-all w-full">
      <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-elevated"
        style={{ border: '1px solid var(--border-medium)' }}>
        <span className="font-bold gold-glow" style={{ fontFamily: "Tiro Telugu, serif", fontSize: 15 }}>
          {scripture.title_telugu.charAt(0)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="rounded-full px-2 py-0.5 font-medium flex-shrink-0 text-xs"
            style={{ background: "#C88F2D22", color: GOLD, border: '1px solid #C88F2D33' }}>{badge}</span>
          {scripture.deity && <span className="text-muted-light truncate" style={{ fontSize: 10 }}>{scripture.deity}</span>}
        </div>
        <p className="font-bold truncate gold-glow" style={{ fontFamily: "Tiro Telugu, serif", fontSize: 13 }}>
          {scripture.title_telugu}
        </p>
        <p className="truncate text-muted" style={{ fontSize: 10 }}>{scripture.title_english}</p>
      </div>
      <BookOpen size={14} className="flex-shrink-0 text-muted" />
    </Link>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: mainCategories = [] } = usePublicCategories();
  const allCats = useMemo(
    () => [{ key: "all", label: "All" }, ...mainCategories.map((c) => ({
      key: c.key || c.slug,
      label: c.label_te || c.label,
    }))],
    [mainCategories]
  );
  const subFromUrl = searchParams.get("sub");
  const parentKey = resolveBrowseParentKey(searchParams, mainCategories);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCat, setActiveCat] = useState(searchParams.get("cat") || "all");
  const [activeSubKey, setActiveSubKey] = useState(subFromUrl || "all");
  const [view, setView] = useState("list");
  const [, forceUpdate] = useState(0);

  const browseMode = !!parentKey;
  const mainCategory = browseMode ? findMainCategory(mainCategories, parentKey) : null;

  const { data: dynamicSubs = [] } = usePublicSubcategories(parentKey, { enabled: !!parentKey });
  const subcategories = useMemo(
    () => (parentKey ? mergePublicSubcategories(parentKey, dynamicSubs) : []),
    [parentKey, dynamicSubs]
  );

  const subChips = useMemo(
    () => [
      { key: "all", label: "అన్నీ" },
      ...subcategories.map((s) => ({
        key: s.key,
        label: s.labelTe || s.label,
        sub: s,
      })),
    ],
    [subcategories]
  );

  useEffect(() => {
    setActiveSubKey(subFromUrl || "all");
    if (searchParams.get("cat")) setActiveCat(searchParams.get("cat"));
  }, [subFromUrl, searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const apiParams = useMemo(() => {
    const params = {};
    const q = debouncedQuery.trim();
    if (q) params.q = q;

    if (browseMode && parentKey) {
      params.parent_category = parentKey;
      if (activeSubKey !== "all") {
        const sub = subcategories.find((s) => s.key === activeSubKey);
        if (sub) {
          params.subcategory = sub.key;
          if (sub.filterCat) params.category = sub.filterCat;
        }
      }
    } else if (!browseMode && activeCat !== "all") {
      params.category = activeCat;
    }
    return params;
  }, [debouncedQuery, browseMode, parentKey, activeSubKey, activeCat, subcategories]);

  const showResults = debouncedQuery.trim() || browseMode || activeCat !== "all";
  const listParams = showResults ? apiParams : {};

  const { data: scriptures = EMPTY_SCRIPTURES, isLoading, isFetching, isError, refetch } = usePublicScriptures(listParams, {
    placeholderData: keepPreviousData,
  });

  function selectSubcategory(key) {
    setActiveSubKey(key);
    const params = new URLSearchParams(searchParams);
    if (key === "all") {
      params.delete("sub");
      params.set("cat", parentKey);
      params.set("parent", parentKey);
    } else {
      const sub = subcategories.find((s) => s.key === key);
      params.set("sub", key);
      params.set("cat", sub?.filterCat || parentKey);
      params.set("parent", parentKey);
    }
    setSearchParams(params, { replace: true });
  }

  const results = useMemo(() => scriptures, [scriptures]);

  // Admins can drag-reorder scriptures within a subcategory's list; the new
  // order is saved via the same order field the admin panel's table uses.
  const canReorder = isAdmin() && browseMode && !debouncedQuery.trim();
  const [prevResults, setPrevResults] = useState(results);
  const [orderedResults, setOrderedResults] = useState(results);
  if (results !== prevResults) {
    setPrevResults(results);
    setOrderedResults(results);
  }

  const dragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  const reorderMutation = useMutation({
    mutationFn: scriptureApi.reorderScriptures,
    onError: () => {
      toast.error("Could not save the new order — reverted.");
      setOrderedResults(results);
    },
  });

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = orderedResults.map((s) => s.id);
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(orderedResults, oldIndex, newIndex);
    setOrderedResults(reordered);
    reorderMutation.mutate(reordered.map((s) => s.id));
  }

  function clearFilters() {
    setQuery("");
    if (browseMode) {
      setActiveSubKey("all");
      const params = new URLSearchParams(searchParams);
      params.delete("sub");
      params.set("cat", parentKey);
      setSearchParams(params, { replace: true });
    } else {
      setActiveCat("all");
    }
  }

  // Full-page loader only on first load — never while typing.
  if (isLoading && scriptures.length === 0) {
    return (
      <div className="min-h-screen page-bg">
        <ScriptureLoadingState />
      </div>
    );
  }

  if (isError && scriptures.length === 0) {
    return (
      <div className="min-h-screen page-bg">
        <ScriptureErrorState onRetry={refetch} />
      </div>
    );
  }

  const chips = browseMode ? subChips : allCats;
  const activeChipKey = browseMode ? activeSubKey : activeCat;

  const activeSub = browseMode && activeSubKey !== "all"
    ? subcategories.find((s) => s.key === activeSubKey)
    : null;

  const pageTitle = browseMode
    ? (activeSub?.labelTe || activeSub?.label || mainCategory?.label || "Search")
    : "Search";

  const pageSubtitle = browseMode
    ? (activeSub ? mainCategory?.en : mainCategory?.en)
    : null;

  return (
    <div className="min-h-screen w-full overflow-x-hidden page-bg">

      <div className="page-header px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {browseMode && (
              <Link
                to={`/categories/${parentKey}`}
                className="p-1.5 rounded-lg flex-shrink-0 hover:bg-white/5 transition-colors"
                style={{ color: GOLD }}
                aria-label="Back to subcategories"
              >
                <ChevronLeft size={20} />
              </Link>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-xl gold-glow truncate" style={{ fontFamily: "Tiro Telugu, serif" }}>
                {pageTitle}
              </h1>
              {browseMode && pageSubtitle && (
                <p className="text-xs text-muted mt-0.5 truncate">{pageSubtitle}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1 rounded-xl p-1 bg-elevated" style={{ border: '1px solid var(--border-subtle)' }}>
            <button onClick={() => setView("list")}
              className="p-1.5 rounded-lg transition-all"
              style={{ background: view === "list" ? '#C88F2D22' : 'transparent', color: GOLD }}>
              <List size={15} />
            </button>
            <button onClick={() => setView("grid")}
              className="p-1.5 rounded-lg transition-all"
              style={{ background: view === "grid" ? '#C88F2D22' : 'transparent', color: GOLD }}>
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
        <div className="search-field">
          <Search size={15} className="search-field-icon" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search scriptures, mantras, verses..."
            className="form-input search-field-input pr-9 py-2.5"
            style={{ fontFamily: "Tiro Telugu, serif" }}
            autoFocus />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide native-x-scroll scroll-row">
        <div className="flex gap-2 px-4 pt-3 pb-2" style={{ width: "max-content" }}>
          {chips.map((chip) => {
            const active = activeChipKey === chip.key;
            return (
              <button
                key={chip.key}
                onClick={() => browseMode ? selectSubcategory(chip.key) : setActiveCat(chip.key)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: active ? GOLD_SOLID : 'var(--bg-card)',
                  color: active ? 'var(--bg-page)' : 'var(--text-muted)',
                  border: active ? 'none' : '1px solid var(--border-medium)',
                  fontFamily: browseMode ? 'Tiro Telugu, serif' : 'inherit',
                }}
              >
                {chip.label || chip.en}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-24">
        <AnimatePresence mode="wait">

          {!showResults && (
            <motion.div key="trending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="corner-card rounded-2xl p-4 mb-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={15} color={GOLD_SOLID} />
                  <span className="font-semibold text-sm gold-glow">Trending</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map(t => (
                    <button key={t} onClick={() => setQuery(t)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors bg-elevated"
                      style={{ border: '1px solid var(--border-medium)', color: GOLD }}>
                      <Hash size={10} style={{ color: GOLD_SOLID }} />{t}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-muted text-xs mb-3">All scriptures ({scriptures.length})</p>
              {view === "list" ? (
                <div className="space-y-2">
                  {scriptures.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3) }}>
                      <ScriptureRow scripture={s} parentKey={parentKey} subcategories={subcategories} mainCategories={mainCategories} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {scriptures.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3) }}>
                      <ScriptureCard scripture={s} onBookmarkChange={() => forceUpdate(n => n + 1)} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {showResults && results.length > 0 && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between py-2 mb-2">
                <span className="text-muted text-xs">
                  {query && <span className="font-semibold gold-glow">"{query}" — </span>}
                  {results.length} results
                  {canReorder && <span className="ml-2 text-[10px] opacity-70">· drag to reorder</span>}
                </span>
                {(query || activeChipKey !== "all") && (
                  <button onClick={clearFilters}
                    className="text-xs underline gold-glow">clear</button>
                )}
              </div>
              {canReorder ? (
                <DndContext sensors={dragSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={orderedResults.map((s) => s.id)}
                    strategy={view === "list" ? verticalListSortingStrategy : rectSortingStrategy}
                  >
                    {view === "list" ? (
                      <div className="space-y-2">
                        {orderedResults.map((s) => (
                          <SortableResultItem key={s.id} id={s.id}>
                            <ScriptureRow scripture={s} parentKey={parentKey} subcategories={subcategories} mainCategories={mainCategories} />
                          </SortableResultItem>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {orderedResults.map((s) => (
                          <SortableResultItem key={s.id} id={s.id}>
                            <ScriptureCard scripture={s} onBookmarkChange={() => forceUpdate(n => n + 1)} />
                          </SortableResultItem>
                        ))}
                      </div>
                    )}
                  </SortableContext>
                </DndContext>
              ) : view === "list" ? (
                <div className="space-y-2">
                  {results.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.25) }}>
                      <ScriptureRow scripture={s} parentKey={parentKey} subcategories={subcategories} mainCategories={mainCategories} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {results.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.25) }}>
                      <ScriptureCard scripture={s} onBookmarkChange={() => forceUpdate(n => n + 1)} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {showResults && results.length === 0 && !isFetching && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 text-muted">
              <Search size={44} className="mx-auto mb-4 opacity-20" />
              <p className="text-base font-semibold gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>No results</p>
              <p className="text-xs mt-1 text-muted">Try different keywords</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
