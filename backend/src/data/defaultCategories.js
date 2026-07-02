/** The 8 main app sections (home grid) — seeded into the categories collection */
const DEFAULT_CATEGORIES = [
  { slug: 'stotra', label: 'స్తోత్రాలు', label_en: 'Stotras', color: 'from-rose-700 to-red-900', bg: 'bg-rose-700', text: 'text-rose-700' },
  { slug: 'mantra', label: 'మంత్రాలు', label_en: 'Mantras', color: 'from-orange-600 to-amber-800', bg: 'bg-orange-600', text: 'text-orange-600' },
  { slug: 'agama', label: 'వైఖానస ఆగమము', label_en: 'Vaikhanasa Agama', color: 'from-teal-700 to-emerald-900', bg: 'bg-teal-700', text: 'text-teal-700' },
  { slug: 'pooja_vidhanam', label: 'పూజా విధానం', label_en: 'Puja Vidhanam', color: 'from-yellow-600 to-amber-700', bg: 'bg-yellow-600', text: 'text-yellow-600' },
  { slug: 'book', label: 'పుస్తకాలు', label_en: 'Books', color: 'from-stone-600 to-stone-800', bg: 'bg-stone-600', text: 'text-stone-600' },
  { slug: 'alaya_viseshalu', label: 'ఆలయ విశేషాలు', label_en: 'Temple Specialties', color: 'from-amber-700 to-orange-900', bg: 'bg-amber-700', text: 'text-amber-700' },
  { slug: 'sandeha_nivrutti', label: 'వైఖానస సందేహ నివృత్తి', label_en: 'Vaikhanasa Q&A', color: 'from-indigo-700 to-violet-900', bg: 'bg-indigo-700', text: 'text-indigo-700' },
  { slug: 'chitralu', label: 'చిత్రాలు', label_en: 'Images', color: 'from-rose-600 to-pink-800', bg: 'bg-rose-600', text: 'text-rose-600' },
];

const CATEGORY_DISPLAY_ORDER = DEFAULT_CATEGORIES.map((c) => c.slug);

/** Valid scripture.category slugs from migration — sub-types under Stotras, not top-level categories */
const FILTER_CATEGORY_SLUGS = ['ashtottaram', 'sahasranamam'];

module.exports = { DEFAULT_CATEGORIES, CATEGORY_DISPLAY_ORDER, FILTER_CATEGORY_SLUGS };
