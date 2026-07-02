import { LayoutDashboard, BookOpen, Tag, Images, ShieldCheck } from 'lucide-react';

export const GOLD_SOLID = '#C88F2D';
export const GOLD_TEXT = '#E4B24B';

export const COLOR_OPTIONS = [
  { value: 'from-rose-700 to-red-900', label: 'Rose' },
  { value: 'from-orange-600 to-amber-800', label: 'Orange' },
  { value: 'from-purple-700 to-violet-900', label: 'Purple' },
  { value: 'from-blue-700 to-indigo-900', label: 'Blue' },
  { value: 'from-teal-700 to-emerald-900', label: 'Teal' },
  { value: 'from-yellow-600 to-amber-700', label: 'Yellow' },
  { value: 'from-sky-600 to-blue-800', label: 'Sky' },
  { value: 'from-stone-600 to-stone-800', label: 'Stone' },
  { value: 'from-green-700 to-lime-800', label: 'Green' },
  { value: 'from-pink-600 to-fuchsia-800', label: 'Pink' },
];

export const CHITRALU_CATEGORY = 'chitralu';

export const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'verifications', label: 'ధృవీకరణ', icon: ShieldCheck },
  { id: 'scriptures', label: 'Scriptures', icon: BookOpen },
  { id: 'gallery', label: 'Gallery', icon: Images },
  { id: 'categories', label: 'Categories', icon: Tag },
];
