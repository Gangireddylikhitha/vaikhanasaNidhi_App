/** Scripture filter slugs (not main home categories) */
const FILTER_CATEGORY_INFO = {
  ashtottaram: {
    label: 'అష్టోత్తరం',
    color: 'from-purple-700 to-violet-900',
    bg: 'bg-purple-700',
    text: 'text-purple-700',
  },
  sahasranamam: {
    label: 'సహస్రనామం',
    color: 'from-blue-700 to-indigo-900',
    bg: 'bg-blue-700',
    text: 'text-blue-700',
  },
};

const DEFAULT_INFO = {
  label: '—',
  color: 'from-stone-600 to-stone-800',
  bg: 'bg-stone-600',
  text: 'text-stone-600',
};

export function getCategoryInfo(category, mainCategories = []) {
  const slug = category?.trim?.().toLowerCase?.() || category;
  if (!slug) return DEFAULT_INFO;

  const fromMain = mainCategories.find(
    (c) => (c.key || c.slug) === slug
  );
  if (fromMain) {
    return {
      label: fromMain.label_te || fromMain.label,
      color: fromMain.color,
      bg: fromMain.bg,
      text: fromMain.text,
    };
  }

  return FILTER_CATEGORY_INFO[slug] || { ...DEFAULT_INFO, label: slug };
}

export function findMainCategory(mainCategories, key) {
  if (!key) return null;
  return mainCategories.find((c) => (c.key || c.slug) === key) || null;
}
