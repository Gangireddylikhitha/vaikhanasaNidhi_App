export function toIstDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
}

const TELUGU_DIGITS = ['౦', '౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯'];

export function toTeluguDigits(value) {
  return String(value).replace(/\d/g, (d) => TELUGU_DIGITS[Number(d)] ?? d);
}

/** "30 జూన్ 2026" → "30 జూన్, 2026" (English numerals) */
export function formatPanchangDateTe(dateLabel) {
  if (!dateLabel) return '—';
  return dateLabel.replace(/(\d+ \S+)\s+(\d{4})/, '$1, $2');
}

/** 60-year cycle names → Telugu (for cached API data) */
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

export function formatSamvatsaramTe(name) {
  if (!name || name === '—') return '—';
  const raw = String(name).trim();
  if (SAMVATSARA_TE[raw]) return SAMVATSARA_TE[raw];
  const title = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return SAMVATSARA_TE[title] ?? raw;
}

/** Full title: "పరాభవ నామ సంవత్సరం" */
export function formatSamvatsaramTitleTe(samvatsaram) {
  if (!samvatsaram || samvatsaram === '—') return '—';
  if (samvatsaram.includes('సంవత్సరం')) return samvatsaram;
  const te = formatSamvatsaramTe(samvatsaram);
  return `${te} నామ సంవత్సరం`;
}

const CHOGHADIYA_TE = {
  Udveg: 'ఉద్వేగం',
  Char: 'చర్',
  Labh: 'లాభం',
  Amrit: 'అమృతం',
  Kaal: 'కాలం',
  Shubh: 'శుభం',
  Rog: 'రోగం',
};

function teluguTimePrefix(hour, meridiem) {
  const ap = (meridiem || '').toLowerCase();
  if (ap === 'am') {
    if (hour < 6) return 'అ.';
    if (hour < 12) return 'ఉ.';
    return 'మ.';
  }
  if (ap === 'pm') {
    if (hour === 12 || hour < 4) return 'మ.';
    if (hour < 7) return 'సా.';
    return 'రా.';
  }
  return '';
}

function formatClockTe(token) {
  const m = token.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!m) return token.trim();
  const hour = Number(m[1]);
  const prefix = teluguTimePrefix(hour, m[3]);
  const displayHour = String(hour).padStart(2, '0');
  const displayMin = m[2];
  return prefix ? `${prefix} ${displayHour}:${displayMin}` : `${displayHour}:${displayMin}`;
}

/** "10:39 am - 12:15 pm" → Telugu clock labels */
export function formatTimeRangeTe(range) {
  if (!range || range === '—') return '—';
  return range
    .split(/\s*-\s*/)
    .map(formatClockTe)
    .join(' - ');
}

/** Localize choghadiya / daily-info strings to Telugu */
export function localizeDailyInfoText(text) {
  if (!text || text === '—') return '—';
  return text
    .split(' • ')
    .map((part) => {
      let line = part.trim();
      for (const [en, te] of Object.entries(CHOGHADIYA_TE)) {
        line = line.replace(new RegExp(`\\b${en}\\b`, 'g'), te);
      }
      const colon = line.indexOf(':');
      if (colon === -1) return line;
      const label = line.slice(0, colon).trim();
      const times = line.slice(colon + 1).trim();
      return `${label}: ${formatTimeRangeTe(times)}`;
    })
    .join(' • ');
}

export function localizeDailyInfoList(list) {
  if (!Array.isArray(list) || !list.length) return '—';
  return localizeDailyInfoText(list.join(' • '));
}

export function getPanchangamSourceLabel(source) {
  switch (source) {
    case 'stored':
      return 'సేవ్ చేసిన పంచాంగం';
    case 'computed':
      return 'లెక్కించిన పంచాంగం (దృక్)';
    case 'local':
      return 'స్థానిక అంచనా';
    default:
      return null;
  }
}

export function formatPanchangValue(value) {
  if (!value || value === '—') return '—';
  return value;
}

function parseNithraClock(sunrise) {
  if (!sunrise || sunrise === '—') return null;
  const m = String(sunrise).match(/(\d{1,2})\.(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
  if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

function formatMinutes(mins) {
  const wrapped = ((mins % 1440) + 1440) % 1440;
  const hh = Math.floor(wrapped / 60);
  const mm = wrapped % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Widget: "5.48 AM" → "05:48" */
export function formatWidgetSunrise(sunrise) {
  const total = parseNithraClock(sunrise);
  if (total == null) return sunrise || '—';
  return formatMinutes(total);
}

/** Widget: compact "07:30 - 09:00" from Nithra range text */
export function formatWidgetTimeRange(range) {
  if (!range || range === '—') return '—';
  const times = [...String(range).matchAll(/(\d{1,2})[.:](\d{2})/g)];
  if (times.length >= 2) {
    const fmt = (t) => `${t[1].padStart(2, '0')}:${t[2]}`;
    return `${fmt(times[0])} - ${fmt(times[1])}`;
  }
  return range;
}

/** Brahma muhurtam: 96–48 minutes before sunrise */
export function formatWidgetBrahmaMuhurtam(sunrise) {
  const total = parseNithraClock(sunrise);
  if (total == null) return null;
  return `${formatMinutes(total - 96)} - ${formatMinutes(total - 48)}`;
}
