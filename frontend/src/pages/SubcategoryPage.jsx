import { useState, useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, Search } from "lucide-react";
import {
  getSubcategories,
  subcategorySearchUrl,
} from "../data/categories";
import { usePublicSubcategories } from "../hooks/usePublicSubcategories";
import { usePublicCategories } from "../hooks/usePublicCategories";
import { findMainCategory } from "../utils/categoryLookup";

export default function SubcategoryPage() {
  const { categoryKey } = useParams();
  const { data: mainCategories = [], isLoading } = usePublicCategories();
  const category = findMainCategory(mainCategories, categoryKey);
  const staticSubs = getSubcategories(categoryKey);
  const { data: dynamicSubs = [] } = usePublicSubcategories(categoryKey);
  const [query, setQuery] = useState("");

  const subs = useMemo(() => {
    const mappedDynamic = dynamicSubs.map((item) => ({
      key: item.key || item.id,
      label: item.label_en || item.label,
      labelTe: item.label_te || item.label,
      filterCat: item.filter_cat || item.parent_key || categoryKey,
      searchTerms: item.search_terms || [],
      img: item.image_url || null,
    }));
    const byKey = new Map(staticSubs.map((item) => [item.key, item]));
    mappedDynamic.forEach((item) => byKey.set(item.key, item));
    return [...byKey.values()];
  }, [staticSubs, dynamicSubs, categoryKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subs;
    return subs.filter(
      s =>
        s.label.toLowerCase().includes(q) ||
        s.labelTe.includes(query.trim())
    );
  }, [subs, query]);

  if (!isLoading && mainCategories.length && !category) {
    return <Navigate to="/categories" replace />;
  }

  if (!category) return null;

  const Icon = category.icon;
  const title = category.label_te || category.label;
  const subtitle = category.label_en || category.en;

  return (
    <div className="min-h-screen page-bg pb-24">
      <div className="page-header px-4 sm:px-6 pt-5 pb-5">
        <Link to="/categories" className="inline-flex items-center gap-1 text-xs text-muted mb-3 hover:opacity-80">
          <ChevronLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-3">
          {category.img && (
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ border: "1px solid var(--border-subtle)" }}>
              <img src={category.img} alt={title} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h1 className="font-telugu font-bold text-xl gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
              {title}
            </h1>
            <p className="text-sm text-muted">{subtitle}</p>
          </div>
          {Icon && (
            <div className="ml-auto w-10 h-10 rounded-xl flex items-center justify-center bg-elevated" style={{ border: "1px solid var(--border-subtle)" }}>
              <Icon size={18} className="text-primary-gold" />
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-2xl mx-auto">
        {category.hasSearch && (
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={category.searchPlaceholder || "వెతకండి..."}
              className="w-full pl-10 pr-4 py-3 rounded-xl form-input text-sm"
            />
          </div>
        )}

        <div className="space-y-2">
          {filtered.map((sub, i) => (
            <motion.div
              key={sub.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={subcategorySearchUrl(categoryKey, sub)}
                className="corner-card rounded-xl p-4 flex items-center gap-3 hover:brightness-110 transition-all"
              >
                {sub.img ? (
                  <img src={sub.img} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-elevated flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-muted" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-telugu font-semibold gold-glow truncate" style={{ fontFamily: "Tiro Telugu, serif" }}>
                    {sub.labelTe || sub.label}
                  </p>
                  <p className="text-xs text-muted truncate">{sub.label}</p>
                </div>
                <ChevronRight size={16} className="text-muted flex-shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
