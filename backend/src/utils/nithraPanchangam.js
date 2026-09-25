/**
 * Nithra-style Telugu Panchangam text formatting (Drik logic, traditional labels).
 */
const {
  tithiTe,
  nakshatraTe,
  yogaTe,
  karanaTe,
  varaTe,
  masaTe,
  AYANA_TE,
  RITU_TE,
  samvatsaraTe,
  MONTHS_TE,
} = require('../data/panchangamTelugu');
const { parseIstDate } = require('./panchangamDate');
const { GeoVector, Ecliptic, Body } = require('astronomy-engine');

let nithraCalendarData = {};
try {
  nithraCalendarData = require('../data/nithraCalendarData.json');
} catch (e) {
  nithraCalendarData = {};
}

function getNithraEntry(dateKey) {
  return nithraCalendarData?.[dateKey] || null;
}

const PAKSHA_NITHRA = { Shukla: 'శుద్ధ', Krishna: 'బహుళ' };

const VARA_SANSKRIT = [
  'భాను వాసరః',
  'ఇందు వాసరః',
  'భౌమ వాసరః',
  'సౌమ్య వాసరః',
  'గురు వాసరః',
  'భృగు వాసరః',
  'స్థిర వాసరః',
];

function getIstParts(value, timezone = 'Asia/Kolkata') {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(d);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return { hour, minute };
}

function periodPrefix(hour) {
  if (hour >= 0 && hour < 6) return 'అ.';
  if (hour < 12) return 'ఉ.';
  if (hour < 15) return 'మ.';
  if (hour < 18) return 'సా.';
  if (hour < 21) return 'ప.';
  return 'రా.';
}

function formatNithraDotTime(value, timezone) {
  const p = getIstParts(value, timezone);
  if (!p) return '';
  const h12 = p.hour % 12 || 12;
  return `${periodPrefix(p.hour)} ${h12}.${String(p.minute).padStart(2, '0')}`;
}

function formatNithraColonTime(value, timezone) {
  const p = getIstParts(value, timezone);
  if (!p) return '';
  const h12 = p.hour % 12 || 12;
  return `${periodPrefix(p.hour)} ${h12}:${String(p.minute).padStart(2, '0')}`;
}

function formatNithraSunTime(value, timezone) {
  const p = getIstParts(value, timezone);
  if (!p) return '—';
  const h12 = p.hour % 12 || 12;
  const ampm = p.hour < 12 ? 'AM' : 'PM';
  return `${h12}.${String(p.minute).padStart(2, '0')} ${ampm}`;
}

function formatNithraRangeColon(start, end, timezone) {
  if (!start || !end) return '—';
  const s = formatNithraColonTime(start, timezone);
  const e = formatNithraColonTime(end, timezone);
  const endClock = e.includes(' ') ? e.split(' ').slice(1).join(' ') : e;
  return `${s} నుండి ${endClock} వరకు`;
}

function formatDdMmYyyy(dateKey) {
  const d = parseIstDate(dateKey);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getFullYear()}`;
}

function formatHeaderMonthVaaram(dateKey, varaIndex) {
  const d = parseIstDate(dateKey);
  const month = MONTHS_TE[d.getMonth()] || '';
  const vaaram = varaTe(varaIndex).replace(/ం$/, 'ము');
  return `${month} - ${vaaram}`;
}

function masaNithra(masaIndex) {
  const name = masaTe(masaIndex) || '';
  const base = name.replace(/ం$/, '');
  return `${base} మాసం`;
}

function ruthuvuNithra(rituKey) {
  return RITU_TE[rituKey] || rituKey || '—';
}

/**
 * Build తిథి/నక్షత్రం transition line (Nithra style).
 * Uses authoritative `primaryEndTime` for the first segment — the library often
 * truncates transition end at next sunrise even when the anga continues past it.
 */
function buildAngaTransitionLine(
  transitions,
  primaryEndTime,
  nameFn,
  timezone,
  { withPaksha, pakshaShort, allEnds = false } = {}
) {
  if (!transitions?.length) return '—';
  const list = transitions.slice(0, 3);
  const firstEnd = primaryEndTime || list[0].endTime;
  const panchangDayEnd =
    list.length > 1
      ? list[list.length - 1].endTime
      : primaryEndTime && list[0].endTime && primaryEndTime > list[0].endTime
        ? list[0].endTime
        : null;

  const segments = [];
  const firstName = nameFn(list[0]);
  const firstLabel = withPaksha && pakshaShort ? `${pakshaShort} ${firstName}` : firstName;
  segments.push(`${firstLabel} ${formatNithraDotTime(firstEnd, timezone)} వరకు`);

  const hasLaterToday = panchangDayEnd && firstEnd < panchangDayEnd;
  if (hasLaterToday) {
    for (let i = 1; i < list.length; i++) {
      const name = nameFn(list[i]);
      if (allEnds) {
        segments.push(`తదుపరి ${name} ${formatNithraDotTime(list[i].endTime, timezone)} వరకు`);
      } else {
        segments.push(`తదుపరి ${name}`);
      }
    }
  }
  return segments.join(' ');
}

function formatShubhaSamayamulu(choghadiya, timezone) {
  const all = [...(choghadiya?.day || []), ...(choghadiya?.night || [])];
  const good = all.filter((c) => c.rating === 'good' || c.rating === 'excellent');
  if (!good.length) return '—';
  return good
    .slice(0, 4)
    .map((c) => {
      const start = formatNithraDotTime(c.startTime, timezone);
      const endParts = getIstParts(c.endTime, timezone);
      const endClock = endParts
        ? `${endParts.hour % 12 || 12}.${String(endParts.minute).padStart(2, '0')}`
        : '';
      return `${start} నుండి ${endClock} వరకు`;
    })
    .join(' తిరిగి ');
}

function getTithiIndexAt(instant) {
  const sunLon = Ecliptic(GeoVector(Body.Sun, instant, true)).elon;
  const moonLon = Ecliptic(GeoVector(Body.Moon, instant, true)).elon;
  let diff = moonLon - sunLon;
  if (diff < 0) diff += 360;
  return Math.floor(diff / 12);
}

function getShraddhaTithi(dateKey, pakshaKey) {
  if (!dateKey) return '—';
  const noon = new Date(`${dateKey}T12:00:00+05:30`);
  try {
    const tithiIndex = getTithiIndexAt(noon);
    const paksha = PAKSHA_NITHRA[pakshaKey] || '';
    const tithi = tithiTe(tithiIndex);
    return paksha ? `${paksha} ${tithi}` : tithi;
  } catch {
    return '—';
  }
}

function buildNithraDisplay(raw, ctx) {
  const {
    dateKey,
    timezone,
    varaIndex,
    pakshaKey,
    samvatsaram,
    maasamIndex,
    rituKey,
    ayanaKey,
    festivals,
    nithraMuhurta,
  } = ctx;

  const muh = nithraMuhurta || {
    rahuKalamStart: raw.rahuKalamStart,
    rahuKalamEnd: raw.rahuKalamEnd,
    yamagandaKalam: raw.yamagandaKalam,
    gulikaKalam: raw.gulikaKalam,
    varjyamPrimary: raw.varjyam,
    varjyamAll: raw.varjyam,
    durMuhurta: raw.durMuhurta,
    amritAll: raw.amritKalam,
    amritPrimary: raw.amritKalam,
    abhijitMuhurta: raw.abhijitMuhurta,
  };

  const pakshaShort = PAKSHA_NITHRA[pakshaKey] || '';
  const samvatsaraTeName = samvatsaraTe(samvatsaram) || samvatsaram;
  const entry = getNithraEntry(dateKey);

  const defaultFestivalBanner = (() => {
    if (!festivals || festivals.length === 0) return null;
    const nonSpanMajor = festivals.find(
      (f) =>
        (f.category === 'major' ||
          f.category === 'sankranti' ||
          f.category === 'ekadashi' ||
          f.category === 'vrat' ||
          f.category === 'vratham') &&
        f.type !== 'span'
    );
    const target = nonSpanMajor || festivals.find((f) => f.category === 'major') || festivals[0];
    return target?.nameTe || target?.name || null;
  })();

  const festivalBanner = entry?.importantDays || entry?.virathaDays || entry?.festivals || defaultFestivalBanner;

  const tithiLine = entry?.tithi || buildAngaTransitionLine(
    raw.tithis || raw.tithiTransitions,
    raw.tithiEndTime,
    (t) => tithiTe(t.index),
    timezone,
    { withPaksha: true, pakshaShort }
  );

  const nakshatraLine = entry?.nakshatra || buildAngaTransitionLine(
    raw.nakshatras || raw.nakshatraTransitions,
    raw.nakshatraEndTime,
    (t) => nakshatraTe(t.index),
    timezone
  );

  const yogaLine = entry?.yoga || buildAngaTransitionLine(
    raw.yogas || raw.yogaTransitions,
    raw.yogaEndTime,
    (t) => {
      const y = yogaTe(t.index);
      return y === 'ఇంద్ర' ? 'ఇంద్రం' : y;
    },
    timezone
  );

  const karanaLine = entry?.karana || buildAngaTransitionLine(
    raw.karanas || raw.karanaTransitions,
    raw.karanas?.[0]?.endTime,
    (k) => karanaTe(k.name),
    timezone,
    { allEnds: true }
  );

  const durmuhurtham = entry?.durmuhurtam
    ? (entry.durmuhurtam.includes(' తిరిగి ')
        ? entry.durmuhurtam.split(' తిరిగి ').map((s) => s.trim())
        : [entry.durmuhurtam])
    : (muh.durMuhurta || [])
        .map((p) => formatNithraRangeColon(p.start, p.end, timezone))
        .filter((s) => s !== '—');

  const varjyam = entry?.varjyam
    ? [entry.varjyam]
    : (muh.varjyamPrimary || [])
        .map((p) => formatNithraRangeColon(p.start, p.end, timezone))
        .filter((s) => s !== '—');

  const amritaGadiyalu = entry?.amritaGadiyalu
    ? [entry.amritaGadiyalu]
    : (muh.amritPrimary || [])
        .map((p) => formatNithraRangeColon(p.start, p.end, timezone))
        .filter((s) => s !== '—');

  return {
    headerMonthVaaram: formatHeaderMonthVaaram(dateKey, varaIndex),
    vasaraSanskrit: VARA_SANSKRIT[varaIndex] || '—',
    dateDdMmYyyy: entry?.dateDdMmYyyy || formatDdMmYyyy(dateKey),
    samvatsaraTitle: entry?.teluguYearname
      ? (entry.teluguYearname.startsWith('శ్రీ') ? entry.teluguYearname : `శ్రీ ${entry.teluguYearname}`)
      : (samvatsaraTeName ? `శ్రీ ${samvatsaraTeName} నామ సంవత్సరం` : '—'),
    maasam: entry?.teluguMonth || masaNithra(maasamIndex),
    ruthuvu: entry?.ruthulu || ruthuvuNithra(rituKey),
    ayanam: entry?.ayanam || AYANA_TE[ayanaKey] || ayanaKey || '—',
    festivalBanner,
    sunrise: entry?.sunrise || formatNithraSunTime(raw.sunrise, timezone),
    sunset: entry?.sunset || formatNithraSunTime(raw.sunset, timezone),
    moonrise: entry?.moonrise || formatNithraSunTime(raw.moonrise, timezone),
    moonset: entry?.moonset || formatNithraSunTime(raw.moonset, timezone),
    tithiLine,
    nakshatraLine,
    yogaLine,
    karanaLine,
    shubhaSamayamulu: entry?.subhaTime || formatShubhaSamayamulu(raw.choghadiya, timezone),
    shraddhaTithi: entry?.shraddhaTithi || getShraddhaTithi(dateKey, pakshaKey),
    rahukalam: entry?.rahukalam || formatNithraRangeColon(muh.rahuKalamStart, muh.rahuKalamEnd, timezone),
    yamagandam: entry?.yamagandam || formatNithraRangeColon(muh.yamagandaKalam?.start, muh.yamagandaKalam?.end, timezone),
    gulikakalam: formatNithraRangeColon(muh.gulikaKalam?.start, muh.gulikaKalam?.end, timezone),
    durmuhurtham,
    varjyam,
    varjyamAll: varjyam,
    amritaGadiyalu,
    abhijitMuhurtham: formatNithraRangeColon(muh.abhijitMuhurta?.start, muh.abhijitMuhurta?.end, timezone),
  };
}

module.exports = { buildNithraDisplay, PAKSHA_NITHRA, getNithraEntry };
