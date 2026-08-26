/**
 * Nithra Calendar–style muhurta timings (Telugu panchang standard).
 * Rahu / Yamaganda / Gulika use traditional fixed weekday slots (IST).
 * Varjyam / Amrita stay astronomy-based; we pick the primary window for the day.
 */

/** [hour, minute] pairs in IST — Sun through Sat */
const FIXED_RAHU = [
  [[16, 30], [18, 0]],
  [[7, 30], [9, 0]],
  [[15, 0], [16, 30]],
  [[12, 0], [13, 30]],
  [[13, 30], [15, 0]],
  [[10, 30], [12, 0]],
  [[9, 0], [10, 30]],
];

const FIXED_YAMAGANDA = [
  [[12, 0], [13, 30]],
  [[10, 30], [12, 0]],
  [[9, 0], [10, 30]],
  [[7, 30], [9, 0]],
  [[6, 0], [7, 30]],
  [[15, 0], [16, 30]],
  [[13, 30], [15, 0]],
];

const FIXED_GULIKA = [
  [[13, 30], [15, 0]],
  [[12, 0], [13, 30]],
  [[10, 30], [12, 0]],
  [[9, 0], [10, 30]],
  [[7, 30], [9, 0]],
  [[6, 0], [7, 30]],
  [[15, 0], [16, 30]],
];

function istInstant(dateKey, hour, minute) {
  return new Date(
    `${dateKey}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+05:30`
  );
}

function fixedRange(dateKey, table, varaIndex) {
  const row = table[varaIndex];
  if (!row) return null;
  return {
    start: istInstant(dateKey, row[0][0], row[0][1]),
    end: istInstant(dateKey, row[1][0], row[1][1]),
  };
}

function getIstHour(value, timezone = 'Asia/Kolkata') {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return -1;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(d);
  return Number(parts.find((p) => p.type === 'hour')?.value ?? -1);
}

function periodsOnPanchangDay(periods, sunrise) {
  if (!sunrise) return [];
  const dayStart = sunrise.getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;
  return periods.filter((p) => {
    if (!p?.start) return false;
    const s = p.start.getTime();
    return s >= dayStart && s < dayEnd;
  });
}

/** Primary afternoon varjyam on this panchang day. */
function pickPrimaryVarjyam(periods = [], sunrise, _sunset, timezone = 'Asia/Kolkata') {
  const onThisDay = periodsOnPanchangDay(periods, sunrise);
  if (!onThisDay.length) return [];

  const afternoon = onThisDay.filter((p) => {
    const h = getIstHour(p.start, timezone);
    return h >= 12 && h < 18;
  });

  const daytime = onThisDay.filter((p) => {
    const h = getIstHour(p.start, timezone);
    return h >= 6 && h < 21;
  });

  const pick = afternoon[0] || daytime[0] || onThisDay[0];
  return pick ? [pick] : [];
}

/** Primary early-morning amrita ghadiya (Nithra shows one night slot). */
function pickPrimaryAmrita(periods = [], sunrise, timezone = 'Asia/Kolkata') {
  const onThisDay = periodsOnPanchangDay(periods, sunrise);
  if (!onThisDay.length) return [];

  const night = onThisDay.filter((p) => {
    const h = getIstHour(p.start, timezone);
    return h >= 0 && h < 6;
  });

  return night.length ? [night[0]] : onThisDay.length ? [onThisDay[0]] : [];
}

function buildNithraMuhurtas(raw, { dateKey, varaIndex, timezone }) {
  const rahu = fixedRange(dateKey, FIXED_RAHU, varaIndex);
  const yamaganda = fixedRange(dateKey, FIXED_YAMAGANDA, varaIndex);
  const gulika = fixedRange(dateKey, FIXED_GULIKA, varaIndex);
  const varjyamAll = raw.varjyam || [];
  const amritAll = raw.amritKalam || [];
  const varjyamPrimary = pickPrimaryVarjyam(varjyamAll, raw.sunrise, raw.sunset, timezone);
  const amritPrimary = pickPrimaryAmrita(amritAll, raw.sunrise, timezone);

  return {
    rahuKalamStart: rahu?.start,
    rahuKalamEnd: rahu?.end,
    yamagandaKalam: yamaganda,
    gulikaKalam: gulika,
    varjyamAll,
    varjyamPrimary,
    amritAll,
    amritPrimary,
    durMuhurta: raw.durMuhurta || [],
    abhijitMuhurta: raw.abhijitMuhurta,
  };
}

module.exports = {
  buildNithraMuhurtas,
  pickPrimaryVarjyam,
  pickPrimaryAmrita,
  FIXED_RAHU,
  FIXED_YAMAGANDA,
};
