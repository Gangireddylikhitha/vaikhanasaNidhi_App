const { VISHNU_SAHASRANAMA_SLOKAS } = require('../data/sahasraNamalu');

/** Calendar day number in Asia/Kolkata (IST) — matches India app users */
function getIstDayNumber(date = new Date()) {
  const ist = new Date(
    new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  );
  ist.setHours(0, 0, 0, 0);
  return Math.floor(ist.getTime() / 86_400_000);
}

function getIstDateKey(date = new Date()) {
  return new Date(date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

/**
 * Today's Vishnu Sahasranama śloka from static backend list
 * (`src/data/sahasraNamalu.js`) — same 108 as the frontend.
 */
function getDailySloka(date = new Date()) {
  const dayNum = getIstDayNumber(date);
  const index = dayNum % VISHNU_SAHASRANAMA_SLOKAS.length;
  const sloka = VISHNU_SAHASRANAMA_SLOKAS[index];
  return {
    index: index + 1,
    total: VISHNU_SAHASRANAMA_SLOKAS.length,
    date: getIstDateKey(date),
    telugu: sloka.telugu,
    meaning: sloka.meaning,
    source: sloka.source,
  };
}

module.exports = { getDailySloka, getIstDateKey };
