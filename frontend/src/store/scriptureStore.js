import { SCRIPTURES as DEFAULT_SCRIPTURES } from '../data/scriptures';

const KEY = 'vaikhanasa-scriptures';
const CAT_KEY = 'vaikhanasa-categories';

const DEFAULT_CATEGORIES = [
  { id: 'stotra', label: 'స్తోత్రం', label_en: 'Stotra', color: 'from-rose-700 to-red-900', bg: 'bg-rose-700', text: 'text-rose-700' },
  { id: 'mantra', label: 'మంత్రం', label_en: 'Mantra', color: 'from-orange-600 to-amber-800', bg: 'bg-orange-600', text: 'text-orange-600' },
  { id: 'ashtottaram', label: 'అష్టోత్తరం', label_en: 'Ashtottaram', color: 'from-purple-700 to-violet-900', bg: 'bg-purple-700', text: 'text-purple-700' },
  { id: 'sahasranamam', label: 'సహస్రనామం', label_en: 'Sahasranamam', color: 'from-blue-700 to-indigo-900', bg: 'bg-blue-700', text: 'text-blue-700' },
  { id: 'agama', label: 'ఆగమం', label_en: 'Agama', color: 'from-teal-700 to-emerald-900', bg: 'bg-teal-700', text: 'text-teal-700' },
  { id: 'pooja_vidhanam', label: 'పూజా విధానం', label_en: 'Pooja Vidhanam', color: 'from-yellow-600 to-amber-700', bg: 'bg-yellow-600', text: 'text-yellow-600' },
  { id: 'panchangam', label: 'పంచాంగం', label_en: 'Panchangam', color: 'from-sky-600 to-blue-800', bg: 'bg-sky-600', text: 'text-sky-600' },
  { id: 'book', label: 'గ్రంథం', label_en: 'Book', color: 'from-stone-600 to-stone-800', bg: 'bg-stone-600', text: 'text-stone-600' },
];

export function getScriptures() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SCRIPTURES;
  } catch { return DEFAULT_SCRIPTURES; }
}

export function saveScripture(scripture) {
  const all = getScriptures();
  const idx = all.findIndex(s => s.id === scripture.id);
  if (idx >= 0) all[idx] = scripture;
  else all.push({ ...scripture, id: Date.now().toString() });
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
