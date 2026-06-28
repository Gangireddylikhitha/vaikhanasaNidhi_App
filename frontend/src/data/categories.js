import { Music, Zap, BookMarked, FlameKindling, Library, Landmark, HelpCircle, Image } from "lucide-react";

import imgStotras from "../assets/catagoryImages/stotras.png";
import imgMantras from "../assets/catagoryImages/mantras.png";
import imgAgama from "../assets/catagoryImages/agama.png";
import imgPooja from "../assets/catagoryImages/puja_vidhanam.png";
import imgBooks from "../assets/catagoryImages/grandalu.png";
import imgAshtottaram from "../assets/catagoryImages/astothranamalu.png";
import imgSahasranamam from "../assets/catagoryImages/sahastranamalu.png";
import alaya_viseshalu from "../assets/catagoryImages/alayaavisesalu.png";
import vaikhanasa_sandeha_nivrutti from "../assets/catagoryImages/vaikhanasaSandeha.png";
import imgChitralu from "../assets/catagoryImages/chitralu.png";

/** Top-level categories (పంచాంగం removed — still at /panchangam via nav/widget) */
export const MAIN_CATEGORIES = [
  {
    key: "stotra",
    label: "స్తోత్రాలు",
    en: "Stotras",
    icon: Music,
    img: imgSahasranamam,
    hasSearch: false,
  },
  {
    key: "mantra",
    label: "మంత్రాలు",
    en: "Mantras",
    icon: Zap,
    img: imgMantras,
    hasSearch: false,
  },
  {
    key: "agama",
    label: "వైఖానస ఆగమము",
    en: "Vaikhanasa Agama",
    icon: BookMarked,
    img: imgAgama,
    hasSearch: false,
  },
  {
    key: "pooja_vidhanam",
    label: "పూజా విధానం",
    en: "Puja Vidhanam",
    icon: FlameKindling,
    img: imgPooja,
    hasSearch: true,
    searchPlaceholder: "పుస్తక శీర్షికతో వెతకండి...",
  },
  {
    key: "book",
    label: "పుస్తకాలు",
    en: "Books",
    icon: Library,
    img: imgBooks,
    hasSearch: true,
    searchPlaceholder: "పుస్తక శీర్షికతో వెతకండి...",
  },
  {
    key: "alaya_viseshalu",
    label: "ఆలయ విశేషాలు",
    en: "Temple Specialties",
    icon: Landmark,
    img: alaya_viseshalu,
    hasSearch: true,
    searchPlaceholder: "పుస్తక శీర్షికతో వెతకండి...",
  },
  {
    key: "sandeha_nivrutti",
    label: "వైఖానస సందేహ నివృత్తి",
    en: "Vaikhanasa Q&A",
    icon: HelpCircle,
    img: vaikhanasa_sandeha_nivrutti,
    hasSearch: false,
  },
  {
    key: "chitralu",
    label: "చిత్రాలు",
    en: "Images",
    icon: Image,
    img: imgChitralu,
    hasSearch: true,
    searchPlaceholder: "చిత్రాలు వెతకండి...",
  },
];

/** Subcategories per main category */
export const SUBCATEGORIES = {
  stotra: [
    { key: "ashtotharams", label: "Ashtotharams", labelTe: "అష్టోత్తరాలు", filterCat: "ashtottaram", img: imgAshtottaram },
    { key: "stotras", label: "Stotras", labelTe: "స్తోత్రాలు", filterCat: "stotra", img: imgStotras },
    { key: "suprabhatams", label: "Suprabhatams", labelTe: "సుప్రభాతాలు", filterCat: "stotra", searchTerms: ["suprabhatam", "సుప్రభాత"] },
    { key: "kavachams", label: "Kavachams", labelTe: "కవచాలు", filterCat: "stotra", searchTerms: ["kavacham", "కవచ"] },
    { key: "sahasranamams", label: "Sahasranamams", labelTe: "సహస్రనామాలు", filterCat: "sahasranamam", img: imgSahasranamam },
    { key: "others", label: "ఇతరములు", labelTe: "ఇతరములు", filterCat: "stotra" },
  ],
  mantra: [
    { key: "sandhyavandanam", label: "Sandhyavandanam & others", labelTe: "సంధ్యావందనం", filterCat: "mantra", searchTerms: ["sandhya", "సంధ్య"] },
    { key: "devaalaya_utsava", label: "Devaalaya utsava manthras", labelTe: "దేవాలయ ఉత్సవ మంత్రాలు", filterCat: "mantra", searchTerms: ["utsava", "ఉత్సవ"] },
    { key: "brahmotsva", label: "Brahmotsva manthras", labelTe: "బ్రహ్మోత్సవ మంత్రాలు", filterCat: "mantra", searchTerms: ["brahmotsava", "బ్రహ్మోత్సవ"] },
    { key: "prathishta", label: "Prathishta manthras", labelTe: "ప్రతిష్ఠ మంత్రాలు", filterCat: "mantra", searchTerms: ["prathishta", "ప్రతిష్ఠ"] },
    { key: "saarerika", label: "Saarerika Manthras", labelTe: "శారీరిక మంత్రాలు", filterCat: "mantra", searchTerms: ["saarerika", "శారీరిక"] },
    { key: "visesha_homalu", label: "Visesha Homalu", labelTe: "విశేష హోమాలు", filterCat: "mantra", searchTerms: ["homa", "హోమ"] },
    { key: "others", label: "ఇతరములు", labelTe: "ఇతరములు", filterCat: "mantra" },
  ],
  agama: [
    { key: "vaikhanasa_agama", label: "Vaikhanasa Agama", labelTe: "వైఖానస ఆగమం", filterCat: "agama", img: imgAgama },
    { key: "others", label: "ఇతరములు", labelTe: "ఇతరములు", filterCat: "agama" },
  ],
  pooja_vidhanam: [
    { key: "nitya_pooja", label: "Nitya Pooja", labelTe: "నిత్య పూజ", filterCat: "pooja_vidhanam", searchTerms: ["nitya", "నిత్య"] },
    { key: "vishesha_pooja", label: "Vishesha Pooja", labelTe: "విశేష పూజ", filterCat: "pooja_vidhanam", searchTerms: ["vishesha", "విశేష"] },
    { key: "vratams", label: "Vratams", labelTe: "వ్రతాలు", filterCat: "pooja_vidhanam", searchTerms: ["vratam", "వ్రత"] },
    { key: "others", label: "ఇతరములు", labelTe: "ఇతరములు", filterCat: "pooja_vidhanam" },
  ],
  book: [
    { key: "scriptures", label: "Scriptures", labelTe: "శాస్త్రాలు", filterCat: "book", searchTerms: ["scripture", "శాస్త్ర"] },
    { key: "history", label: "History", labelTe: "చరిత్ర", filterCat: "book", searchTerms: ["history", "చరిత్ర"] },
    { key: "commentaries", label: "Commentaries", labelTe: "వ్యాఖ్యానాలు", filterCat: "book", searchTerms: ["commentary", "వ్యాఖ్యాన"] },
    { key: "others", label: "ఇతరములు", labelTe: "ఇతరములు", filterCat: "book" },
  ],
  alaya_viseshalu: [
    { key: "temples", label: "Temples", labelTe: "ఆలయాలు", filterCat: "book", searchTerms: ["temple", "ఆలయ"] },
    { key: "traditions", label: "Traditions", labelTe: "సంప్రదాయాలు", filterCat: "book", searchTerms: ["tradition", "సంప్రదాయ"] },
    { key: "festivals", label: "Festivals", labelTe: "పండుగలు", filterCat: "book", searchTerms: ["festival", "పండుగ", "utsav"] },
    { key: "others", label: "ఇతరములు", labelTe: "ఇతరములు", filterCat: "book" },
  ],
  sandeha_nivrutti: [
    { key: "doubts", label: "Vaikhanasa Sandeha Nivrutti", labelTe: "వైఖానస సందేహ నివృత్తి", filterCat: "agama", searchTerms: ["sandeha", "సందేహ"] },
    { key: "others", label: "ఇతరములు", labelTe: "ఇతరములు", filterCat: "agama" },
  ],
  chitralu: [
    { key: "brahmotsavam", label: "Brahmotsavam Pics", labelTe: "బ్రహ్మోత్సవ చిత్రాలు", filterCat: "chitralu", searchTerms: ["brahmotsavam", "బ్రహ్మోత్సవ"] },
    { key: "satyanarayana_vratam", label: "Satyanarayana Vratam Pics", labelTe: "సత్యనారాయణ వ్రత చిత్రాలు", filterCat: "chitralu", searchTerms: ["satyanarayana", "సత్యనారాయణ"] },
    { key: "kalyanotsavam", label: "Kalyanotsavam Pics", labelTe: "కల్యాణోత్సవ చిత్రాలు", filterCat: "chitralu", searchTerms: ["kalyanotsavam", "కల్యాణోత్సవ"] },
    { key: "varalakshmi_vratam", label: "Varalakshmi Vratam Setups", labelTe: "వరలక్ష్మీ వ్రత అలంకరణలు", filterCat: "chitralu", searchTerms: ["varalakshmi", "వరలక్ష్మీ"] },
    { key: "homam_yagam", label: "Homam & Yagam Pics", labelTe: "హోమం & యాగం చిత్రాలు", filterCat: "chitralu", searchTerms: ["homam", "yagam", "హోమ", "యాగ"] },
    { key: "abhishekam", label: "Abhishekam Pics", labelTe: "అభిషేక చిత్రాలు", filterCat: "chitralu", searchTerms: ["abhishekam", "అభిషేక"] },
  ],
};

export function getMainCategory(key) {
  return MAIN_CATEGORIES.find(c => c.key === key) || null;
}

export function getSubcategories(parentKey) {
  return SUBCATEGORIES[parentKey] || [];
}

export function getSubcategory(parentKey, subKey) {
  return getSubcategories(parentKey).find(s => s.key === subKey) || null;
}

/** Find main category key that owns a subcategory key */
export function findParentForSubKey(subKey) {
  if (!subKey) return null;
  for (const main of MAIN_CATEGORIES) {
    if (getSubcategories(main.key).some((s) => s.key === subKey)) {
      return main.key;
    }
  }
  return null;
}

/** Resolve parent from URL search params */
export function resolveBrowseParentKey(searchParams, dynamicSubs = []) {
  const parent = searchParams.get('parent');
  if (parent) return parent;
  const sub = searchParams.get('sub');
  const fromSub = findParentForSubKey(sub);
  if (fromSub) return fromSub;
  if (sub && dynamicSubs.length) {
    const match = dynamicSubs.find((item) => item.key === sub);
    if (match?.parent_key) return match.parent_key;
  }
  const cat = searchParams.get('cat');
  if (cat && MAIN_CATEGORIES.some((c) => c.key === cat)) return cat;
  return null;
}

/** Build search URL for a subcategory */
export function subcategorySearchUrl(parentKey, sub) {
  const params = new URLSearchParams();
  params.set("cat", sub.filterCat || parentKey);
  params.set("sub", sub.key);
  params.set("parent", parentKey);
  return `/search?${params.toString()}`;
}
