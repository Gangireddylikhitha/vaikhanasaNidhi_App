const FILTER_CAT_COLORS = {
  stotra: 'from-rose-700 to-red-900',
  ashtottaram: 'from-purple-700 to-violet-900',
  sahasranamam: 'from-blue-700 to-indigo-900',
  mantra: 'from-orange-600 to-amber-800',
  agama: 'from-teal-700 to-emerald-900',
  pooja_vidhanam: 'from-yellow-600 to-amber-700',
  book: 'from-stone-600 to-stone-800',
  alaya_viseshalu: 'from-amber-700 to-orange-900',
  sandeha_nivrutti: 'from-indigo-700 to-violet-900',
  chitralu: 'from-rose-600 to-pink-800',
};

function sub(parent_key, key, label, label_en, filter_cat, search_terms = []) {
  const fc = filter_cat || parent_key;
  return {
    parent_key,
    key,
    label,
    label_te: label,
    label_en,
    filter_cat: fc,
    search_terms,
    color: FILTER_CAT_COLORS[fc] || FILTER_CAT_COLORS[parent_key] || 'from-stone-600 to-stone-800',
  };
}

/** Default subcategories — mirrors frontend src/data/categories.js SUBCATEGORIES */
const DEFAULT_SUBCATEGORIES = [
  // stotra
  sub('stotra', 'ashtotharams', 'అష్టోత్తరాలు', 'Ashtotharams', 'ashtottaram'),
  sub('stotra', 'stotras', 'స్తోత్రాలు', 'Stotras', 'stotra'),
  sub('stotra', 'suprabhatams', 'సుప్రభాతాలు', 'Suprabhatams', 'stotra', ['suprabhatam', 'సుప్రభాత']),
  sub('stotra', 'kavachams', 'కవచాలు', 'Kavachams', 'stotra', ['kavacham', 'కవచ']),
  sub('stotra', 'sahasranamams', 'సహస్రనామాలు', 'Sahasranamams', 'sahasranamam'),
  sub('stotra', 'others', 'ఇతరములు', 'Others', 'stotra'),
  // mantra
  sub('mantra', 'sandhyavandanam', 'సంధ్యావందనం', 'Sandhyavandanam & others', 'mantra', ['sandhya', 'సంధ్య']),
  sub('mantra', 'devaalaya_utsava', 'దేవాలయ ఉత్సవ మంత్రాలు', 'Devaalaya utsava manthras', 'mantra', ['utsava', 'ఉత్సవ']),
  sub('mantra', 'brahmotsva', 'బ్రహ్మోత్సవ మంత్రాలు', 'Brahmotsva manthras', 'mantra', ['brahmotsava', 'బ్రహ్మోత్సవ']),
  sub('mantra', 'prathishta', 'ప్రతిష్ఠ మంత్రాలు', 'Prathishta manthras', 'mantra', ['prathishta', 'ప్రతిష్ఠ']),
  sub('mantra', 'saarerika', 'శారీరిక మంత్రాలు', 'Saarerika Manthras', 'mantra', ['saarerika', 'శారీరిక']),
  sub('mantra', 'visesha_homalu', 'విశేష హోమాలు', 'Visesha Homalu', 'mantra', ['homa', 'హోమ']),
  sub('mantra', 'others', 'ఇతరములు', 'Others', 'mantra'),
  // agama
  sub('agama', 'vaikhanasa_agama', 'వైఖానస ఆగమం', 'Vaikhanasa Agama', 'agama'),
  sub('agama', 'others', 'ఇతరములు', 'Others', 'agama'),
  // pooja_vidhanam
  sub('pooja_vidhanam', 'nitya_pooja', 'నిత్య పూజ', 'Nitya Pooja', 'pooja_vidhanam', ['nitya', 'నిత్య']),
  sub('pooja_vidhanam', 'vishesha_pooja', 'విశేష పూజ', 'Vishesha Pooja', 'pooja_vidhanam', ['vishesha', 'విశేష']),
  sub('pooja_vidhanam', 'vratams', 'వ్రతాలు', 'Vratams', 'pooja_vidhanam', ['vratam', 'వ్రత']),
  sub('pooja_vidhanam', 'others', 'ఇతరములు', 'Others', 'pooja_vidhanam'),
  // book
  sub('book', 'scriptures', 'శాస్త్రాలు', 'Scriptures', 'book', ['scripture', 'శాస్త్ర']),
  sub('book', 'history', 'చరిత్ర', 'History', 'book', ['history', 'చరిత్ర']),
  sub('book', 'commentaries', 'వ్యాఖ్యానాలు', 'Commentaries', 'book', ['commentary', 'వ్యాఖ్యాన']),
  sub('book', 'others', 'ఇతరములు', 'Others', 'book'),
  // alaya_viseshalu
  sub('alaya_viseshalu', 'temples', 'ఆలయాలు', 'Temples', 'book', ['temple', 'ఆలయ']),
  sub('alaya_viseshalu', 'traditions', 'సంప్రదాయాలు', 'Traditions', 'book', ['tradition', 'సంప్రదాయ']),
  sub('alaya_viseshalu', 'festivals', 'పండుగలు', 'Festivals', 'book', ['festival', 'పండుగ', 'utsav']),
  sub('alaya_viseshalu', 'others', 'ఇతరములు', 'Others', 'book'),
  // sandeha_nivrutti
  sub('sandeha_nivrutti', 'doubts', 'వైఖానస సందేహ నివృత్తి', 'Vaikhanasa Sandeha Nivrutti', 'agama', ['sandeha', 'సందేహ']),
  sub('sandeha_nivrutti', 'others', 'ఇతరములు', 'Others', 'agama'),
  // chitralu
  sub('chitralu', 'brahmotsavam', 'బ్రహ్మోత్సవ చిత్రాలు', 'Brahmotsavam Pics', 'chitralu', ['brahmotsavam', 'బ్రహ్మోత్సవ']),
  sub('chitralu', 'satyanarayana_vratam', 'సత్యనారాయణ వ్రత చిత్రాలు', 'Satyanarayana Vratam Pics', 'chitralu', ['satyanarayana', 'సత్యనారాయణ']),
  sub('chitralu', 'kalyanotsavam', 'కల్యాణోత్సవ చిత్రాలు', 'Kalyanotsavam Pics', 'chitralu', ['kalyanotsavam', 'కల్యాణోత్సవ']),
  sub('chitralu', 'varalakshmi_vratam', 'వరలక్ష్మీ వ్రత అలంకరణలు', 'Varalakshmi Vratam Setups', 'chitralu', ['varalakshmi', 'వరలక్ష్మీ']),
  sub('chitralu', 'homam_yagam', 'హోమం & యాగం చిత్రాలు', 'Homam & Yagam Pics', 'chitralu', ['homam', 'yagam', 'హోమ', 'యాగ']),
  sub('chitralu', 'abhishekam', 'అభిషేక చిత్రాలు', 'Abhishekam Pics', 'chitralu', ['abhishekam', 'అభిషేక']),
];

module.exports = { DEFAULT_SUBCATEGORIES, FILTER_CAT_COLORS };
