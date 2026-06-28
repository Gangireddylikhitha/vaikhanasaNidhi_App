import { getSubcategories, SUBCATEGORIES } from '../data/categories';

const FILTER_COLORS = {
  stotra: 'from-rose-700 to-red-900',
  ashtottaram: 'from-purple-700 to-violet-900',
  sahasranamam: 'from-blue-700 to-indigo-900',
  mantra: 'from-orange-600 to-amber-800',
  agama: 'from-teal-700 to-emerald-900',
  pooja_vidhanam: 'from-yellow-600 to-amber-700',
  book: 'from-stone-600 to-stone-800',
  alaya_viseshalu: 'from-amber-700 to-orange-900',
  sandeha_nivrutti: 'from-indigo-700 to-violet-900',
  chitralu: 'from-rose-600 to-pink-800',
};

/** True for subcategories defined in frontend static data (built-in defaults). */
export function isBuiltinSubcategory(parentKey, key) {
  return getSubcategories(parentKey).some((s) => s.key === key);
}

function staticToAdmin(sub, parentKey) {
  const filterCat = sub.filterCat || parentKey;
  return {
    id: `${parentKey}__${sub.key}`,
    key: sub.key,
    parent_key: parentKey,
    filter_cat: filterCat,
    label: sub.labelTe || sub.label,
    label_te: sub.labelTe || sub.label,
    label_en: sub.label,
    search_terms: sub.searchTerms || [],
    color: FILTER_COLORS[filterCat] || FILTER_COLORS[parentKey] || 'from-stone-600 to-stone-800',
    isBuiltin: true,
  };
}

/** Merge built-in subcategories with API data (API wins on same key). */
export function mergeSubcategories(apiSubs = [], parentKey = null) {
  const parentKeys = parentKey
    ? [parentKey]
    : [...new Set([...Object.keys(SUBCATEGORIES), ...apiSubs.map((s) => s.parent_key)])];

  const byKey = new Map();

  parentKeys.forEach((pk) => {
    getSubcategories(pk).forEach((sub) => {
      byKey.set(`${pk}__${sub.key}`, staticToAdmin(sub, pk));
    });
  });

  apiSubs.forEach((s) => {
    byKey.set(`${s.parent_key}__${s.key}`, {
      ...s,
      image_url: s.image_url || null,
      isBuiltin: isBuiltinSubcategory(s.parent_key, s.key),
    });
  });

  let result = [...byKey.values()];
  if (parentKey) {
    result = result.filter((s) => s.parent_key === parentKey);
  }

  return result.sort(sortSubcategories);
}

/** Built-in first (A–Z), custom added items at bottom (oldest → newest). */
function sortSubcategories(a, b) {
  if (a.isBuiltin !== b.isBuiltin) {
    return a.isBuiltin ? -1 : 1;
  }
  if (!a.isBuiltin && !b.isBuiltin) {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return ta - tb;
  }
  return (a.label_en || '').localeCompare(b.label_en || '');
}
