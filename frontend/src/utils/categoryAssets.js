import { Music, Zap, BookMarked, FlameKindling, Library, Landmark, HelpCircle, Image } from 'lucide-react';

import imgStotras from '../assets/catagoryImages/stotras.png';
import imgMantras from '../assets/catagoryImages/mantras.png';
import imgAgama from '../assets/catagoryImages/agama.png';
import imgPooja from '../assets/catagoryImages/puja_vidhanam.png';
import imgBooks from '../assets/catagoryImages/grandalu.png';
import imgAshtottaram from '../assets/catagoryImages/astothranamalu.png';
import imgSahasranamam from '../assets/catagoryImages/sahastranamalu.png';
import alaya_viseshalu from '../assets/catagoryImages/alayaavisesalu.png';
import vaikhanasa_sandeha from '../assets/catagoryImages/vaikhanasaSandeha.png';
import imgChitralu from '../assets/catagoryImages/chitralu.png';

/** Icons and tile images keyed by category slug — labels come from the API */
export const CATEGORY_ASSETS = {
  stotra: { icon: Music, img: imgSahasranamam },
  mantra: { icon: Zap, img: imgMantras },
  agama: { icon: BookMarked, img: imgAgama },
  pooja_vidhanam: { icon: FlameKindling, img: imgPooja },
  book: { icon: Library, img: imgBooks },
  alaya_viseshalu: { icon: Landmark, img: alaya_viseshalu },
  sandeha_nivrutti: { icon: HelpCircle, img: vaikhanasa_sandeha },
  chitralu: { icon: Image, img: imgChitralu },
  ashtottaram: { img: imgAshtottaram },
  sahasranamam: { img: imgSahasranamam },
};

export function enrichCategory(apiCategory) {
  const key = apiCategory.key || apiCategory.slug;
  const assets = CATEGORY_ASSETS[key] || {};
  return {
    ...apiCategory,
    key,
    label: apiCategory.label_te || apiCategory.label,
    en: apiCategory.label_en || apiCategory.en,
    icon: assets.icon,
    img: assets.img,
  };
}

export function enrichCategories(list = []) {
  return list.map(enrichCategory);
}

export function getFallbackCategories() {
  return [];
}
