/** Telugu labels for Drik Panchang fields (index-aligned with @ishubhamx/panchangam-js) */

const TITHI_TE = [
  'పాడ్యమి', 'విదియ', 'తదియ', 'చవితి', 'పంచమి',
  'షష్ఠి', 'సప్తమి', 'అష్టమి', 'నవమి', 'దశమి',
  'ఏకాదశి', 'ద్వాదశి', 'త్రయోదశి', 'చతుర్దశి', 'పౌర్ణమి',
  'పాడ్యమి', 'విదియ', 'తదియ', 'చవితి', 'పంచమి',
  'షష్ఠి', 'సప్తమి', 'అష్టమి', 'నవమి', 'దశమి',
  'ఏకాదశి', 'ద్వాదశి', 'త్రయోదశి', 'చతుర్దశి', 'అమావాస్య',
];

const NAKSHATRA_TE = [
  'అశ్విని', 'భరణి', 'కృత్తిక', 'రోహిణి', 'మృగశిర',
  'ఆర్ద్ర', 'పునర్వసు', 'పుష్యమి', 'ఆశ్లేష', 'మఖ',
  'పూర్వఫల్గుణి', 'ఉత్తరఫల్గుణి', 'హస్త', 'చిత్త', 'స్వాతి',
  'విశాఖ', 'అనురాధ', 'జ్యేష్ఠ', 'మూల', 'పూర్వాషాఢ',
  'ఉత్తరాషాఢ', 'శ్రవణం', 'ధనిష్ఠ', 'శతభిష', 'పూర్వాభాద్ర',
  'ఉత్తరాభాద్ర', 'రేవతి',
];

const YOGA_TE = [
  'విష్కంభ', 'ప్రీతి', 'ఆయుష్మాన్', 'సౌభాగ్య', 'శోభన',
  'అతిగండ', 'సుకర్మ', 'ధృతి', 'శూల', 'గండ',
  'వృద్ధి', 'ధ్రువ', 'వ్యాఘాత', 'హర్షణ', 'వజ్ర',
  'సిద్ధి', 'వ్యతీపాత', 'వరీయాన్', 'పరిఘ', 'శివ',
  'సిద్ధ', 'సాధ్య', 'శుభ', 'శుక్ల', 'బ్రహ్మ',
  'ఇంద్ర', 'వైధృతి',
];

const KARANA_TE = {
  Bava: 'బవ', Balava: 'బాలవ', Kaulava: 'కౌలవ', Taitila: 'తైతుల',
  Gara: 'గర', Vanija: 'వణిజ', Vishti: 'విష్టి (భద్ర)',
  Shakuni: 'శకుని', Chatushpada: 'చతుష్పాద', Naga: 'నాగ', Kimstughna: 'కింస్తుఘ్న',
};

const VARA_TE = [
  'ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం',
  'గురువారం', 'శుక్రవారం', 'శనివారం',
];

const MASA_TE = [
  'చైత్రం', 'వైశాఖం', 'జ్యేష్ఠం', 'ఆషాఢం',
  'శ్రావణం', 'భాద్రపదం', 'ఆశ్వయుజం', 'కార్తీకం',
  'మార్గశిరం', 'పుష్యం', 'మాఘం', 'ఫాల్గుణం',
];

const RASHI_TE = [
  'మేషం', 'వృషభం', 'మిథునం', 'కర్కాటకం',
  'సింహం', 'కన్య', 'తుల', 'వృశ్చికం',
  'ధనుస్సు', 'మకరం', 'కుంభం', 'మీనం',
];

const PAKSHA_TE = { Shukla: 'శుక్ల పక్షం', Krishna: 'కృష్ణ పక్షం' };

const AYANA_TE = { Uttarayana: 'ఉత్తరాయణం', Dakshinayana: 'దక్షిణాయనం' };

const RITU_TE = {
  Vasanta: 'వసంత ఋతువు', Grishma: 'గ్రీష్మ ఋతువు',
  Varsha: 'వర్ష ఋతువు', Sharad: 'శరద్ ఋతువు',
  Hemanta: 'హేమంత ఋతువు', Shishira: 'శిశిర ఋతువు',
};

const MONTHS_TE = [
  'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్',
  'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్',
];

const FESTIVAL_CATEGORY_TE = {
  ekadashi: 'ఏకాదశి',
  solar: 'సంక్రాంతి / సౌర ఉత్సవం',
  vratham: 'వ్రతం',
  pournami: 'పౌర్ణమి',
  amavasya: 'అమావాస్య',
  sankranti: 'సంక్రాంతి',
  major: 'ప్రధాన పండుగ',
  regional: 'ప్రాంతీయ ఉత్సవం',
  single: 'పండుగ',
  span: 'బహుదిన ఉత్సవం',
};

/** 60-year Hindu samvatsara cycle — English/Sanskrit keys → Telugu */
const SAMVATSARA_TE = {
  Prabhava: 'ప్రభవ',
  Vibhava: 'విభవ',
  Shukla: 'శుక్ల',
  Pramoda: 'ప్రమోద',
  Prajapati: 'ప్రజాపతి',
  Angirasa: 'అంగిరస',
  Shrimukha: 'శ్రీముఖ',
  Bhava: 'భవ',
  Yuva: 'యువ',
  Dhatri: 'ధాత్రి',
  Ishvara: 'ఈశ్వర',
  Bahudhanya: 'బహుధాన్య',
  Pramathi: 'ప్రమాథి',
  Vikrama: 'విక్రమ',
  Vrisha: 'వృష',
  Chitrabhanu: 'చిత్రభాను',
  Svabhanu: 'స్వభాను',
  Swabhanu: 'స్వభాను',
  Tarana: 'తారణ',
  Parthiva: 'పార్థివ',
  Vyaya: 'వ్యయ',
  Sarvajit: 'సర్వజిత్',
  Sarvadhari: 'సర్వధారి',
  Virodhi: 'విరోధి',
  Vikriti: 'వికృతి',
  Khara: 'ఖర',
  Nandana: 'నందన',
  Vijaya: 'విజయ',
  Jaya: 'జయ',
  Manmatha: 'మన్మథ',
  Durmukha: 'దుర్ముఖ',
  Hemalamba: 'హేమలమ్బ',
  Vilambi: 'విలమ్బి',
  Vikari: 'వికారి',
  Sharvari: 'శర్వరి',
  Plava: 'ప్లవ',
  Shubhakrit: 'శుభకృత్',
  Shobhakrit: 'శోభకృత్',
  Krodhi: 'క్రోధి',
  Visvavasu: 'విశ్వావసు',
  Vishvavasu: 'విశ్వావసు',
  Parabhava: 'పరాభవ',
  Plavanga: 'ప్లవంగ',
  Kilaka: 'కీలక',
  Saumya: 'సౌమ్య',
  Sadharana: 'సాధారణ',
  Virodhikrit: 'విరోధికృత్',
  Paridhavi: 'పరిధావి',
  Pramadicha: 'ప్రమాదీచ',
  Pramodicha: 'ప్రమాదీచ',
  Ananda: 'ఆనంద',
  Rakshasa: 'రాక్షస',
  Nala: 'నల',
  Pingala: 'పింగళ',
  Kalayukta: 'కాలయుక్త',
  Siddharthi: 'సిద్ధార్థి',
  Raudra: 'రౌద్రి',
  Raudri: 'రౌద్రి',
  Durmati: 'దుర్మతి',
  Dundubhi: 'దుందుభి',
  Rudhirodgari: 'రుధిరోద్గారి',
  Raktakshi: 'రక్తాక്ഷి',
  Krodhana: 'క్రోధన',
  Kshaya: 'క్షయ',
};

function samvatsaraTe(name) {
  if (!name || name === '—') return '';
  const raw = String(name).trim();
  if (SAMVATSARA_TE[raw]) return SAMVATSARA_TE[raw];
  const title = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return SAMVATSARA_TE[title] ?? raw;
}

function te(map, key, fallback = '') {
  if (key == null) return fallback;
  return map[key] ?? map[Number(key)] ?? fallback;
}

function tithiTe(index) {
  return TITHI_TE[index] ?? '';
}

function nakshatraTe(index) {
  return NAKSHATRA_TE[index] ?? '';
}

function yogaTe(index) {
  return YOGA_TE[index] ?? '';
}

function karanaTe(name) {
  return KARANA_TE[name] ?? name ?? '';
}

function formatDateLabel(date) {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS_TE[d.getMonth()]} ${d.getFullYear()}`;
}

module.exports = {
  TITHI_TE,
  NAKSHATRA_TE,
  VARA_TE,
  MASA_TE,
  PAKSHA_TE,
  AYANA_TE,
  RITU_TE,
  FESTIVAL_CATEGORY_TE,
  MONTHS_TE,
  SAMVATSARA_TE,
  tithiTe,
  nakshatraTe,
  yogaTe,
  karanaTe,
  samvatsaraTe,
  formatDateLabel,
  te,
  rashiTe: (index) => RASHI_TE[index] ?? '',
  varaTe: (index) => VARA_TE[index] ?? '',
  masaTe: (index) => MASA_TE[index] ?? '',
};
