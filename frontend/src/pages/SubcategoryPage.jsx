import { useState, useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, Search } from "lucide-react";
import {
  getMainCategory,
  getSubcategories,
  subcategorySearchUrl,
} from "../data/categories";
import { usePublicSubcategories } from "../hooks/usePublicSubcategories";

export default function SubcategoryPage() {
  const { categoryKey } = useParams();
  const category = getMainCategory(categoryKey);
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

  if (!category) return <Navigate to="/categories" replace />;

  return (
    <div className="min-h-screen page-bg pb-24">
      <div className="page-header px-4 sm:px-6 pt-5 pb-5">
        <Link
          to="/categories"
          className="inline-flex items-center gap-1 text-xs text-muted mb-3 hover:opacity-80"
        >
          <ChevronLeft size={14} /> Back
        </Link>
        <h1
          className="font-telugu font-bold text-xl sm:text-2xl gold-glow"
          style={{ fontFamily: "Tiro Telugu, serif" }}
        >
          {category.label}
        </h1>
        <p className="text-sm text-muted mt-1">{category.en}</p>
      </div>

      <div className="px-4 sm:px-6 max-w-2xl mx-auto">
        {category.hasSearch && (
          <div className="flex gap-2 mb-4">
            <div
              className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5 bg-card"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              <Search size={16} className="text-muted flex-shrink-0" />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={category.searchPlaceholder || "Search..."}
                className="flex-1 bg-transparent text-sm outline-none text-body placeholder:text-muted"
                style={{ fontFamily: "Tiro Telugu, serif" }}
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((sub, i) => (
            <motion.div
              key={sub.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Link
                to={subcategorySearchUrl(categoryKey, sub)}
                className="subcategory-row gold-card flex items-center gap-3 px-4 py-3.5 w-full"
              >
                <div className="subcategory-row-icon flex-shrink-0">
                  {sub.img ? (
                    <img
                      src={sub.img}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <BookOpen size={18} className="text-primary-gold" />
                  )}
                </div>
                <span
                  className="flex-1 font-telugu font-semibold text-scale-sm gold-glow text-left"
                  style={{ fontFamily: "Tiro Telugu, serif" }}
                >
                  {sub.labelTe || sub.label}
                </span>
                <ChevronRight size={18} className="text-muted flex-shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted text-sm py-10">No subcategories found</p>
        )}
      </div>
    </div>
  );
}
