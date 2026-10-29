/**
 * Drik Panchang engine — Swiss Ephemeris via astronomy-engine + Lahiri ayanamsa.
 * Wraps @ishubhamx/panchangam-js and maps to Telugu API response.
 */
const { Observer, getPanchangam } = require('@ishubhamx/panchangam-js');
const { GeoVector, Ecliptic, Body } = require('astronomy-engine');
const {
  tithiTe,
  nakshatraTe,
  yogaTe,
  karanaTe,
  varaTe,
  masaTe,
  rashiTe,
  PAKSHA_TE,
  AYANA_TE,
  RITU_TE,
  FESTIVAL_CATEGORY_TE,
  formatDateLabel,
  samvatsaraTe,
} = require('../data/panchangamTelugu');
const { toIstDateKey, parseIstDate } = require('./panchangamDate');
const { buildNithraDisplay, getNithraEntry } = require('./nithraPanchangam');
const { buildPanchangPhases } = require('./panchangPhases');
const { buildNithraMuhurtas } = require('./nithraMuhurta');

const DEFAULT_LAT = 13.6288;
const DEFAULT_LON = 79.4192;
const DEFAULT_TZ = 'Asia/Kolkata';
const DEFAULT_TZ_OFFSET = 330;
/** Telugu / Nithra calendars use Amanta; Purnimanta optional via env */
const DEFAULT_CALENDAR = process.env.PANCHANGAM_CALENDAR_TYPE === 'purnimanta' ? 'purnimanta' : 'amanta';

function getCalendarType() {
  return process.env.PANCHANGAM_CALENDAR_TYPE === 'purnimanta' ? 'purnimanta' : 'amanta';
}

/** Sidereal sun longitude at anchor (Lahiri ayanamsa). */
function getSunSiderealLon(anchorDate, ayanamsa) {
  const sunTrop = Ecliptic(GeoVector(Body.Sun, anchorDate, true)).elon;
  return (sunTrop - ayanamsa + 360) % 360;
}

const RITU_ORDER = ['Vasanta', 'Grishma', 'Varsha', 'Sharad', 'Hemanta', 'Shishira'];

/**
 * Vedic / Chandramana ritu from lunar masa (Telugu / Nithra panchang).
 * Changes every 2 lunar months (masams):
 * - 0: చైత్రం,     1: వైశాఖం     → వసంత ఋతువు (Vasanta)
 * - 2: జ్యేష్ఠం,    3: ఆషాఢం      → గ్రీష్మ ఋతువు (Grishma)
 * - 4: శ్రావణం,    5: భాద్రపదం   → వర్ష ఋతువు (Varsha)
 * - 6: ఆశ్వయుజం,  7: కార్తీకం    → శరదృతువు (Sharad)
 * - 8: మార్గశిరం,  9: పుష్యం     → హేమంత ఋతువు (Hemanta)
 * - 10: మాఘం,    11: ఫాల్గుణం    → శిశిర ఋతువు (Shishira)
 */
function getVedicRitu(masaOrLon, sunSiderealLon) {
  let masaIndex = null;

  if (masaOrLon != null) {
    if (typeof masaOrLon === 'object' && typeof masaOrLon.index === 'number') {
      masaIndex = masaOrLon.index;
    } else if (typeof masaOrLon === 'number' && Number.isInteger(masaOrLon) && masaOrLon >= 0 && masaOrLon < 12) {
      masaIndex = masaOrLon;
    }
  }

  if (masaIndex !== null) {
    const norm = ((Math.floor(masaIndex) % 12) + 12) % 12;
    const rituIndex = Math.floor(norm / 2);
    return RITU_ORDER[rituIndex] || 'Vasanta';
  }

  // Fallback to sidereal sun longitude if masa is unavailable
  const lonVal = typeof masaOrLon === 'number' && masaOrLon >= 12 ? masaOrLon : sunSiderealLon;
  if (lonVal != null) {
    const lon = ((Number(lonVal) % 360) + 360) % 360;
    if (lon >= 330 || lon < 30) return 'Vasanta';
    if (lon >= 30 && lon < 90) return 'Grishma';
    if (lon >= 90 && lon < 150) return 'Varsha';
    if (lon >= 150 && lon < 210) return 'Sharad';
    if (lon >= 210 && lon < 270) return 'Hemanta';
    return 'Shishira';
  }

  return 'Vasanta';
}

/** Vedic ayana — sidereal (Makara→Mithuna = Uttarayana), matches Nithra before Karka Sankranti. */
function getVedicAyana(sunSiderealLon) {
  const lon = ((Number(sunSiderealLon) % 360) + 360) % 360;
  if (lon >= 270 || lon < 90) return 'Uttarayana';
  return 'Dakshinayana';
}

function resolveLocation(input = {}) {
  const lat = Number(input.lat ?? input.latitude ?? process.env.PANCHANGAM_LAT ?? DEFAULT_LAT);
  const lon = Number(input.lon ?? input.longitude ?? process.env.PANCHANGAM_LON ?? DEFAULT_LON);
  const timezone = input.timezone || DEFAULT_TZ;
  const timezoneOffset = Number(input.timezoneOffset ?? DEFAULT_TZ_OFFSET);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error('Invalid latitude');
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    throw new Error('Invalid longitude');
  }

  return { lat, lon, timezone, timezoneOffset };
}

function formatIstTime(value, timezone = DEFAULT_TZ) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

function formatIstRange(start, end, timezone = DEFAULT_TZ) {
  const s = formatIstTime(start, timezone);
  const e = formatIstTime(end, timezone);
  if (s === '—' && e === '—') return '—';
  return `${s} - ${e}`;
}

const { resolveTeluguFestivals } = require('../data/panchangamFestivalsTelugu');


function buildDailyInfo(raw, timezone) {
  const choghadiya = [...(raw.choghadiya?.day || []), ...(raw.choghadiya?.night || [])];
  const goodTime = choghadiya
    .filter((c) => c.rating === 'good' || c.rating === 'excellent')
    .map((c) => `${c.name}: ${formatIstRange(c.startTime, c.endTime, timezone)}`);
  const badTime = choghadiya
    .filter((c) => c.rating === 'bad')
    .map((c) => `${c.name}: ${formatIstRange(c.startTime, c.endTime, timezone)}`);

  const auspiciousActivities = goodTime.slice(0, 3).join(' • ') || '—';
  const inauspiciousActivities = badTime.slice(0, 3).join(' • ') || '—';
  const notes = (raw.specialYogas || [])
    .map((y) => (typeof y === 'string' ? y : y.name))
    .filter(Boolean)
    .join(' • ');

  return { goodTime, badTime, auspiciousActivities, inauspiciousActivities, notes: notes || '—' };
}

/**
 * Compute full daily panchang for a calendar date at the given location.
 * Uses sunrise-anchored Drik Panchang (Lahiri ayanamsa).
 */
function computeDrikPanchangam(dateInput, locationInput = {}) {
  const location = resolveLocation(locationInput);
  const dateKey = typeof dateInput === 'string' ? dateInput : toIstDateKey(dateInput);
  const date = typeof dateInput === 'string' ? parseIstDate(dateKey) : new Date(dateInput);
  const observer = new Observer(location.lat, location.lon, 0);

  const calendarType = locationInput.calendarType || getCalendarType();
  const raw = getPanchangam(date, observer, {
    timezoneOffset: location.timezoneOffset,
    calendarType,
  });

  const { timezone } = location;
  const anchorDate = raw.sunrise || date;
  const sunSiderealLon = getSunSiderealLon(anchorDate, raw.ayanamsa);
  const vedicRituKey = getVedicRitu(raw.masa, sunSiderealLon);
  const vedicAyanaKey = getVedicAyana(sunSiderealLon);

  const nithraMuhurta = buildNithraMuhurtas(raw, {
    dateKey,
    varaIndex: raw.vara,
    timezone,
  });

  const tithiIndex = raw.tithi;
  const nakshatraIndex = raw.nakshatra;
  const yogaIndex = raw.yoga;
  const karanaName = typeof raw.karana === 'string' ? raw.karana : raw.karana?.name;

  const pakshaKey = raw.paksha;
  const paksham = PAKSHA_TE[pakshaKey] || pakshaKey || '—';
  const maasam = masaTe(raw.masa?.index) || raw.masa?.name || '—';
  const samvatsaram = samvatsaraTe(raw.samvat?.samvatsara) || raw.samvat?.samvatsara || '—';
  const ayanam = AYANA_TE[vedicAyanaKey] || vedicAyanaKey || '—';
  const ruthuvu = RITU_TE[vedicRituKey] || vedicRituKey || '—';
  const vaaram = varaTe(raw.vara);

  const tithi = tithiTe(tithiIndex);
  const nakshatra = nakshatraTe(nakshatraIndex);
  const yoga = yogaTe(yogaIndex);
  const karana = karanaTe(karanaName);

  const tithiEndTime = formatIstTime(raw.tithiEndTime, timezone);
  const nakshatraEndTime = formatIstTime(raw.nakshatraEndTime, timezone);
  const yogaEndTime = formatIstTime(raw.yogaEndTime, timezone);
  const karanaEndTime = formatIstTime(raw.karanas?.[0]?.endTime, timezone);

  const rahukalam = formatIstRange(nithraMuhurta.rahuKalamStart, nithraMuhurta.rahuKalamEnd, timezone);
  const yamagandam = formatIstRange(
    nithraMuhurta.yamagandaKalam?.start,
    nithraMuhurta.yamagandaKalam?.end,
    timezone
  );
  const gulikaKalam = formatIstRange(
    nithraMuhurta.gulikaKalam?.start,
    nithraMuhurta.gulikaKalam?.end,
    timezone
  );
  const abhijitMuhurtham = formatIstRange(
    nithraMuhurta.abhijitMuhurta?.start,
    nithraMuhurta.abhijitMuhurta?.end,
    timezone
  );
  const durmuhurtham = (nithraMuhurta.durMuhurta || []).map((p) =>
    formatIstRange(p.start, p.end, timezone)
  );
  const varjyam = (nithraMuhurta.varjyamPrimary || []).map((p) =>
    formatIstRange(p.start, p.end, timezone)
  );
  const varjyamAll = (nithraMuhurta.varjyamAll || []).map((p) =>
    formatIstRange(p.start, p.end, timezone)
  );
  const amritaKalam = (nithraMuhurta.amritPrimary || []).map((p) =>
    formatIstRange(p.start, p.end, timezone)
  );
  const amritaKalamAll = (nithraMuhurta.amritAll || []).map((p) =>
    formatIstRange(p.start, p.end, timezone)
  );

  const festivals = resolveTeluguFestivals(raw.festivals || [], raw, dateKey);
  const dailyInfo = buildDailyInfo(raw, timezone);

  const nithra = buildNithraDisplay(raw, {
    dateKey,
    timezone,
    varaIndex: raw.vara,
    pakshaKey,
    samvatsaram: raw.samvat?.samvatsara,
    maasamIndex: raw.masa?.index,
    rituKey: vedicRituKey,
    ayanaKey: vedicAyanaKey,
    festivals,
    observer,
    nithraMuhurta,
    panchangOptions: {
      timezoneOffset: location.timezoneOffset,
      calendarType,
    },
  });

  const phases = buildPanchangPhases({
    raw,
    nithra,
    tithi,
    tithiEndTime,
    nakshatra,
    nakshatraEndTime,
    yoga,
    yogaEndTime,
    karana,
    karanaEndTime,
    maasam,
    paksham,
    pakshaKey,
    ruthuvu,
    ayanam,
    samvatsaram,
    festivals,
    muhurtham: {
      rahuKalam: rahukalam,
      yamagandam,
      gulikaKalam,
      durmuhurtham,
      abhijitMuhurtham,
      varjyam,
      amritaKalam,
    },
    tithiTe,
    nakshatraTe,
    yogaTe,
    karanaTe,
  });

  const moonRasi = rashiTe(raw.moonRashi?.index);
  const sunRasi = rashiTe(raw.sunRashi?.index);

  const nithraEntry = getNithraEntry(dateKey);

  const finalTithi = nithraEntry?.tithi ? nithraEntry.tithi.split(/\s+(?:ఉ\.|మ\.|సా\.|ప\.|రా\.|తె\.)/)[0] : tithi;
  const finalNakshatra = nithraEntry?.nakshatra ? nithraEntry.nakshatra.split(/\s+(?:ఉ\.|మ\.|సా\.|ప\.|రా\.|తె\.)/)[0] : nakshatra;
  const finalYoga = nithraEntry?.yoga ? nithraEntry.yoga.split(/\s+(?:ఉ\.|మ\.|సా\.|ప\.|రా\.|తె\.)/)[0] : yoga;
  const finalKarana = nithraEntry?.karana ? nithraEntry.karana.split(/\s+(?:ఉ\.|మ\.|సా\.|ప\.|రా\.|తె\.)/)[0] : karana;

  const finalSunrise = nithraEntry?.sunrise || formatIstTime(raw.sunrise, timezone);
  const finalSunset = nithraEntry?.sunset || formatIstTime(raw.sunset, timezone);
  const finalMoonrise = nithraEntry?.moonrise || formatIstTime(raw.moonrise, timezone);
  const finalMoonset = nithraEntry?.moonset || formatIstTime(raw.moonset, timezone);
  const finalRahukalam = nithraEntry?.rahukalam || rahukalam;
  const finalYamagandam = nithraEntry?.yamagandam || yamagandam;
  const finalMaasam = nithraEntry?.teluguMonth || maasam;
  const finalRuthuvu = nithraEntry?.ruthulu || ruthuvu;
  const finalAyana = nithraEntry?.ayanam || ayanam;
  const finalSamvatsaram = nithraEntry?.teluguYearname || samvatsaram;

  const data = {
    date: dateKey,
    dateLabel: formatDateLabel(date),
    teluguDate: `${finalMaasam} ${paksham}`,
    gregorian: formatDateLabel(date),
    samvatsaram: finalSamvatsaram,
    maasam: finalMaasam,
    paksham,
    ayanam: finalAyana,
    ruthuvu: finalRuthuvu,
    ritu: vedicRituKey,
    vaaram,
    day: vaaram,

    sunrise: finalSunrise,
    sunset: finalSunset,
    moonrise: finalMoonrise,
    moonset: finalMoonset,

    tithi: finalTithi,
    tithiEndTime: nithra.tithiLine || tithiEndTime,
    nakshatra: finalNakshatra,
    nakshatraEndTime: nithra.nakshatraLine || nakshatraEndTime,
    yoga: finalYoga,
    yogaEndTime: nithra.yogaLine || yogaEndTime,
    karana: finalKarana,
    karanaEndTime: nithra.karanaLine || karanaEndTime,
    moonRasi,
    sunRasi,

    muhurtham: {
      rahuKalam: finalRahukalam,
      yamagandam: finalYamagandam,
      gulikaKalam,
      durmuhurtham: nithra.durmuhurtham,
      abhijitMuhurtham,
      varjyam: nithra.varjyam,
      amritaKalam: nithra.amritaGadiyalu,
    },

    // Flat fields for backward compatibility
    rahukalam: finalRahukalam,
    yamagandam: finalYamagandam,
    gulikaKalam,
    auspicious: abhijitMuhurtham !== '—' ? `అభిజిత్ ముహూర్తం: ${abhijitMuhurtham}` : '—',

    festivals,
    dailyInfo,
    nithra,
    phases,

    vikramSamvat: raw.samvat?.vikram,
    shakaSamvat: raw.samvat?.shaka,
    ayanamsa: raw.ayanamsa,
    location: {
      lat: location.lat,
      lon: location.lon,
      timezone: location.timezone,
    },
    source: 'computed',
    engine: `drik-lahiri-${calendarType}-nithra-v8`,
    calendarType,
  };

  return data;
}

module.exports = {
  computeDrikPanchangam,
  resolveLocation,
  formatIstTime,
  formatIstRange,
  getCalendarType,
};
