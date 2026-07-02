const { VISHNU_SAHASRANAMA_SLOKAS } = require('../data/sahasraNamalu');

function getLocalDayNumber() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor(now.getTime() / 86_400_000);
}

function getDailySloka(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayNum = Math.floor(d.getTime() / 86_400_000);
  const index = dayNum % VISHNU_SAHASRANAMA_SLOKAS.length;
  const sloka = VISHNU_SAHASRANAMA_SLOKAS[index];
  return {
    index: index + 1,
    total: VISHNU_SAHASRANAMA_SLOKAS.length,
    date: d.toISOString().slice(0, 10),
    telugu: sloka.telugu,
    meaning: sloka.meaning,
    source: sloka.source,
  };
}

module.exports = { getDailySloka };
