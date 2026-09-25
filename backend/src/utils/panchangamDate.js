/** Calendar date in IST as YYYY-MM-DD */
function toIstDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(date));
}

function parseIstDate(dateKey) {
  return new Date(`${dateKey}T12:00:00+05:30`);
}

function getLocationKey(lat, lon) {
  return `${Number(lat).toFixed(4)},${Number(lon).toFixed(4)}`;
}

module.exports = { toIstDateKey, parseIstDate, getLocationKey };
