import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Hash, LayoutGrid, List, BookOpen, ChevronLeft } from "lucide-react";
import ScriptureCard from "../components/ScriptureCard";
import { ScriptureLoadingState, ScriptureErrorState } from "../components/ScriptureLoadingState";
import { usePublicScriptures } from "../hooks/usePublicScriptures";
import { usePublicSubcategories } from "../hooks/usePublicSubcategories";
import { usePublicCategories } from "../hooks/usePublicCategories";
import {
  getSubcategories,
  resolveBrowseParentKey,
} from "../data/categories";
import { findMainCategory } from "../utils/categoryLookup";
import { getScriptureBadgeLabel } from "../utils/scriptureSubcategoryMatch";

const GOLD = "#E4B24B";
const GOLD_SOLID = "#C88F2D";
const TRENDING = ["Venkateswara", "Gayatri", "Lakshmi", "Suprabhatam", "Sahasranama", "Mantra", "Narasimha", "Hayagriva"];

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
    <a href={"/read/" + scripture.id}
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
    </a>
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

  const { data: scriptures = [], isLoading, isError, refetch } = usePublicScriptures(listParams);

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

  if (isLoading) {
    return (
      <div className="min-h-screen page-bg">
        <ScriptureLoadingState />
      </div>
    );
  }

  if (isError) {
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
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search scriptures, mantras, verses..."
            className="form-input pl-9 pr-9 py-2.5"
            style={{ fontFamily: "Tiro Telugu, serif" }}
            autoFocus />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
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
                </span>
                {(query || activeChipKey !== "all") && (
                  <button onClick={clearFilters}
                    className="text-xs underline gold-glow">clear</button>
                )}
              </div>
              {view === "list" ? (
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

          {showResults && results.length === 0 && (
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
