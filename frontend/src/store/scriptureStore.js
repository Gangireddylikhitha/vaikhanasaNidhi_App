import { SCRIPTURES as DEFAULT_SCRIPTURES } from '../data/scriptures';

const KEY = 'vaikhanasa-scriptures';
const CAT_KEY = 'vaikhanasa-categories';

const DEFAULT_SCRIPTURE_IDS = new Set(DEFAULT_SCRIPTURES.map(s => s.id));

/** Admin scripture category options (flat keys used on scripture.category) */
const DEFAULT_CATEGORIES = [
  { id: 'stotra', label: 'స్తోత్రం', label_en: 'Stotra', color: 'from-rose-700 to-red-900', bg: 'bg-rose-700', text: 'text-rose-700' },
  { id: 'mantra', label: 'మంత్రం', label_en: 'Mantra', color: 'from-orange-600 to-amber-800', bg: 'bg-orange-600', text: 'text-orange-600' },
  { id: 'ashtottaram', label: 'అష్టోత్తరం', label_en: 'Ashtottaram', color: 'from-purple-700 to-violet-900', bg: 'bg-purple-700', text: 'text-purple-700' },
  { id: 'sahasranamam', label: 'సహస్రనామం', label_en: 'Sahasranamam', color: 'from-blue-700 to-indigo-900', bg: 'bg-blue-700', text: 'text-blue-700' },
  { id: 'agama', label: 'ఆగమం', label_en: 'Agama', color: 'from-teal-700 to-emerald-900', bg: 'bg-teal-700', text: 'text-teal-700' },
  { id: 'pooja_vidhanam', label: 'పూజా విధానం', label_en: 'Pooja Vidhanam', color: 'from-yellow-600 to-amber-700', bg: 'bg-yellow-600', text: 'text-yellow-600' },
  { id: 'book', label: 'గ్రంథం', label_en: 'Book', color: 'from-stone-600 to-stone-800', bg: 'bg-stone-600', text: 'text-stone-600' },
  { id: 'alaya_viseshalu', label: 'ఆలయ విశేషాలు', label_en: 'Temple Specialties', color: 'from-amber-700 to-orange-900', bg: 'bg-amber-700', text: 'text-amber-700' },
  { id: 'sandeha_nivrutti', label: 'సందేహ నివృత్తి', label_en: 'Vaikhanasa Q&A', color: 'from-indigo-700 to-violet-900', bg: 'bg-indigo-700', text: 'text-indigo-700' },
  { id: 'chitralu', label: 'చిత్రాలు', label_en: 'Images', color: 'from-rose-600 to-pink-800', bg: 'bg-rose-600', text: 'text-rose-600' },
];

export function getScriptures() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SCRIPTURES;
    const stored = JSON.parse(raw);
    const storedMap = new Map(stored.map(s => [s.id, s]));
    const merged = DEFAULT_SCRIPTURES.map(def => {
      const saved = storedMap.get(def.id);
      if (!saved) return def;
      if ((def.verses?.length || 0) > (saved.verses?.length || 0)) return def;
      return saved;
    });
    const adminAdded = stored.filter(s => !DEFAULT_SCRIPTURE_IDS.has(s.id));
    return [...merged, ...adminAdded];
  } catch { return DEFAULT_SCRIPTURES; }
}

/** Scriptures added via Admin (not in bundled defaults), newest first */
export function getRecentAddonScriptures(limit = 12) {
  return getScriptures()
    .filter(s => !DEFAULT_SCRIPTURE_IDS.has(s.id))
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, limit);
}

export function saveScripture(scripture) {
  const all = getScriptures();
  const idx = all.findIndex(s => s.id === scripture.id);
  if (idx >= 0) {
    all[idx] = scripture;
  } else {
    all.unshift({ ...scripture, id: Date.now().toString(), addedAt: Date.now() });
  }
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteScripture(id) {
  const all = getScriptures().filter(s => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getCategories() {
  try {
    const raw = localStorage.getItem(CAT_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  } catch { return DEFAULT_CATEGORIES; }
}

export function saveCategory(cat) {
  const all = getCategories();
  const idx = all.findIndex(c => c.id === cat.id);
  if (idx >= 0) all[idx] = cat;
  else all.push({ ...cat, id: cat.id || cat.label_en.toLowerCase().replace(/\s+/g, '_') });
  localStorage.setItem(CAT_KEY, JSON.stringify(all));
}

export function deleteCategory(id) {
  const all = getCategories().filter(c => c.id !== id);
  localStorage.setItem(CAT_KEY, JSON.stringify(all));
}
