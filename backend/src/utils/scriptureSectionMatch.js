/** Match scriptures to main sections — mirrors frontend scriptureSubcategoryMatch.js */

const UNIQUE_SLUG_MAP = {
  ashtottaram: { parent_key: 'stotra', key: 'ashtotharams' },
  sahasranamam: { parent_key: 'stotra', key: 'sahasranamams' },
  sandeha_nivrutti: { parent_key: 'sandeha_nivrutti', key: 'doubts' },
  chitralu: { parent_key: 'chitralu', key: 'brahmotsavam' },
};

const LEGACY_CATEGORY_TO_MAIN = {
  ashtottaram: 'stotra',
  sahasranamam: 'stotra',
};

const MAIN_SECTION_KEYS = [
  'stotra',
  'mantra',
  'agama',
  'pooja_vidhanam',
  'book',
  'alaya_viseshalu',
  'sandeha_nivrutti',
  'chitralu',
];

function titleHay(scripture) {
  return `${scripture.title_telugu || ''} ${scripture.title_english || ''} ${scripture.description || ''}`.toLowerCase();
}

function titleMatches(scripture, terms) {
  const hay = titleHay(scripture);
  return terms.some((t) => hay.includes(String(t).toLowerCase()));
}

function resolveLegacySubcategory(scripture) {
  const cat = scripture.category;

  if (UNIQUE_SLUG_MAP[cat]) return UNIQUE_SLUG_MAP[cat];

  if (cat === 'stotra') {
    if (titleMatches(scripture, ['suprabhatam', 'సుప్రభాత'])) {
      return { parent_key: 'stotra', key: 'suprabhatams' };
    }
    if (titleMatches(scripture, ['kavacham', 'kavach', 'కవచ'])) {
      return { parent_key: 'stotra', key: 'kavachams' };
    }
    return { parent_key: 'stotra', key: 'stotras' };
  }

  if (cat === 'mantra') {
    if (titleMatches(scripture, ['sandhya', 'sandhyavandanam', 'సంధ్య'])) {
      return { parent_key: 'mantra', key: 'sandhyavandanam' };
    }
    if (titleMatches(scripture, ['brahmotsav', 'బ్రహ్మోత్సవ'])) {
      return { parent_key: 'mantra', key: 'brahmotsva' };
    }
    if (titleMatches(scripture, ['prathishta', 'ప్రతిష్ఠ'])) {
      return { parent_key: 'mantra', key: 'prathishta' };
    }
    if (titleMatches(scripture, ['homa', 'హోమ', 'yagam', 'యాగ'])) {
      return { parent_key: 'mantra', key: 'visesha_homalu' };
    }
    if (titleMatches(scripture, ['utsava', 'ఉత్సవ'])) {
      return { parent_key: 'mantra', key: 'devaalaya_utsava' };
    }
    return { parent_key: 'mantra', key: 'others' };
  }

  if (cat === 'agama') return { parent_key: 'agama', key: 'vaikhanasa_agama' };
  if (cat === 'book') return { parent_key: 'book', key: 'scriptures' };
  if (cat === 'pooja_vidhanam') return { parent_key: 'pooja_vidhanam', key: 'others' };

  if (cat === 'alaya_viseshalu') {
    if (titleMatches(scripture, ['charithra', 'చరిత్ర', 'history'])) {
      return { parent_key: 'alaya_viseshalu', key: 'traditions' };
    }
    if (titleMatches(scripture, ['festival', 'పండుగ', 'nakshatra', 'నక్షత్ర'])) {
      return { parent_key: 'alaya_viseshalu', key: 'festivals' };
    }
    return { parent_key: 'alaya_viseshalu', key: 'temples' };
  }

  return null;
}

function resolveMainSection(scripture) {
  if (scripture.parent_category && MAIN_SECTION_KEYS.includes(scripture.parent_category)) {
    return scripture.parent_category;
  }

  if (scripture.subcategory) {
    // parent_category may be missing on older admin saves
    const cat = scripture.category;
    if (MAIN_SECTION_KEYS.includes(cat)) return cat;
  }

  const cat = scripture.category;
  if (LEGACY_CATEGORY_TO_MAIN[cat]) return LEGACY_CATEGORY_TO_MAIN[cat];
  if (MAIN_SECTION_KEYS.includes(cat)) return cat;

  const legacy = resolveLegacySubcategory(scripture);
  if (legacy?.parent_key) return legacy.parent_key;

  return null;
}

/** Resolve parent + subcategory for backfill and admin display. */
function resolveScripturePlacement(scripture) {
  if (scripture.subcategory && scripture.parent_category) {
    return {
      parent_category: scripture.parent_category,
      subcategory: scripture.subcategory,
      category: scripture.category,
    };
  }

  const legacy = resolveLegacySubcategory(scripture);
  if (legacy) {
    return {
      parent_category: legacy.parent_key,
      subcategory: legacy.key,
      category: scripture.category,
    };
  }

  const parentKey = resolveMainSection(scripture);
  if (parentKey && MAIN_SECTION_KEYS.includes(scripture.category)) {
    return {
      parent_category: parentKey,
      subcategory: scripture.subcategory || '',
      category: scripture.category,
    };
  }

  return null;
}

function countScripturesForMainSection(scriptures, mainKey) {
  return scriptures.filter((s) => resolveMainSection(s) === mainKey).length;
}

module.exports = {
  resolveMainSection,
  resolveLegacySubcategory,
  resolveScripturePlacement,
  countScripturesForMainSection,
  MAIN_SECTION_KEYS,
};
