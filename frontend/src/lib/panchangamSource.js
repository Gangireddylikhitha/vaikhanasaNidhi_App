export function toIstDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
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
