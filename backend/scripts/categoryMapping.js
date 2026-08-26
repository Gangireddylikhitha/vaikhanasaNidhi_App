const VALID_SLUGS = new Set([
  'stotra',
  'mantra',
  'ashtottaram',
  'sahasranamam',
  'agama',
  'pooja_vidhanam',
  'book',
  'alaya_viseshalu',
  'sandeha_nivrutti',
  'chitralu',
]);

const CATEGORY_ALIASES = {
  stotras: 'stotra',
  stotra: 'stotra',
  mantras: 'mantra',
  mantra: 'mantra',
  'temple mantras': 'mantra',
  ashtottaram: 'ashtottaram',
  ashtotharam: 'ashtottaram',
  ashtotharams: 'ashtottaram',
  ashtottarams: 'ashtottaram',
  ashtottharams: 'ashtottaram',
  sahasranamam: 'sahasranamam',
  sahasranamams: 'sahasranamam',
  agama: 'agama',
  'vaikhanasa agama': 'agama',
  'vaikhanasa agamam': 'agama',
  'about vaikhanasa kalpasuthram': 'agama',
  'pooja vidhanam': 'pooja_vidhanam',
  'puja vidhanam': 'pooja_vidhanam',
  pooja_vidhanam: 'pooja_vidhanam',
  books: 'book',
  book: 'book',
  grandhalu: 'book',
  'alaya viseshalu': 'alaya_viseshalu',
  'alaya visheshalu': 'alaya_viseshalu',
  temples: 'alaya_viseshalu',
  festivals: 'alaya_viseshalu',
  traditions: 'alaya_viseshalu',
  'temple specialties': 'alaya_viseshalu',
  alaya_viseshalu: 'alaya_viseshalu',
  sandeha: 'sandeha_nivrutti',
  'vaikhanasa q&a': 'sandeha_nivrutti',
  'sandeha nivrutti': 'sandeha_nivrutti',
  sandeha_nivrutti: 'sandeha_nivrutti',
  'vaikhanasa sandheha nivrutthi': 'sandeha_nivrutti',
  chitralu: 'chitralu',
  images: 'chitralu',
};

function normalizeLabel(value) {
  if (!value || typeof value !== 'string') return '';
  return value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

function slugFromLabel(value) {
  const normalized = normalizeLabel(value);
  if (!normalized) return null;

  if (CATEGORY_ALIASES[normalized]) {
    return CATEGORY_ALIASES[normalized];
  }

  const underscored = normalized.replace(/\s+/g, '_');
  if (VALID_SLUGS.has(underscored)) {
    return underscored;
  }

  return null;
}

function mapCategory(book) {
  const skip = new Set(['other', 'others', 'ఇతరములు']);
  const candidates = [book.subCategory, book.category, book.mainCategory].filter(
    (value) => value && !skip.has(normalizeLabel(value))
  );

  for (const candidate of candidates) {
    const slug = slugFromLabel(candidate);
    if (slug) return slug;
  }

  return null;
}

module.exports = {
  VALID_SLUGS,
  mapCategory,
  slugFromLabel,
  normalizeLabel,
};
