/** Tailwind badge classes per filter category slug */
const FILTER_CAT_STYLES = {
  stotra: { bg: 'bg-rose-700', text: 'text-rose-700' },
  ashtottaram: { bg: 'bg-purple-700', text: 'text-purple-700' },
  sahasranamam: { bg: 'bg-blue-700', text: 'text-blue-700' },
  mantra: { bg: 'bg-orange-600', text: 'text-orange-600' },
  agama: { bg: 'bg-teal-700', text: 'text-teal-700' },
  pooja_vidhanam: { bg: 'bg-yellow-600', text: 'text-yellow-600' },
  book: { bg: 'bg-stone-600', text: 'text-stone-600' },
  alaya_viseshalu: { bg: 'bg-amber-700', text: 'text-amber-700' },
  sandeha_nivrutti: { bg: 'bg-indigo-700', text: 'text-indigo-700' },
  chitralu: { bg: 'bg-rose-600', text: 'text-rose-600' },
};

function resolveCategoryStyles(filterCat, parentKey) {
  const slug = (filterCat || parentKey || '').trim().toLowerCase();
  return FILTER_CAT_STYLES[slug] || { bg: '', text: '' };
}

module.exports = { FILTER_CAT_STYLES, resolveCategoryStyles };
