/**
 * Structured Panchang phases (Nithra / traditional Telugu layout).
 */
const { PAKSHA_NITHRA } = require('./nithraPanchangam');

function nextFromTransitions(transitions, nameFn) {
  if (!transitions?.[1]) return null;
  return nameFn(transitions[1]);
}

function detectSpecialDays(tithiIndex, pakshaKey, festivals = []) {
  const isShukla = pakshaKey === 'Shukla';
  const ekadashi =
    (isShukla && tithiIndex === 10) || (!isShukla && tithiIndex === 25);
  const amavasya = tithiIndex === 29;
  const pournami = tithiIndex === 14;

  const sankranti = festivals.filter(
    (f) =>
      f.category === 'sankranti' ||
      f.category === 'solar' ||
      f.type === 'sankranti' ||
      /sankranti|సంక్రాంతి/i.test(f.name || '')
  );
  const ekadashiFestivals = festivals.filter(
    (f) => f.category === 'ekadashi' || /ekadashi|ఏకాదశి/i.test(f.name || '')
  );

  return {
    isEkadashi: ekadashi || ekadashiFestivals.length > 0,
    isAmavasya: amavasya || festivals.some((f) => f.category === 'amavasya'),
    isPournami: pournami || festivals.some((f) => f.category === 'pournami'),
    isSankranti: sankranti.length > 0,
    sankrantiNames: sankranti.map((f) => f.name),
    ekadashiName: ekadashiFestivals[0]?.name || (ekadashi ? 'ఏకాదశి' : null),
    amavasyaLabel: amavasya ? 'అమావాస్య' : null,
    pournamiLabel: pournami ? 'పౌర్ణమి' : null,
  };
}

function buildPanchangPhases(ctx) {
  const {
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
    muhurtham,
    tithiTe,
    nakshatraTe,
    yogaTe,
    karanaTe,
  } = ctx;

  const special = detectSpecialDays(raw.tithi, pakshaKey, festivals);
  const pakshaShort = PAKSHA_NITHRA[pakshaKey] || paksham;

  return {
    phase1: {
      label: 'Phase 1 — Sun & Moon',
      sunrise: nithra.sunrise,
      sunset: nithra.sunset,
      moonrise: nithra.moonrise,
      moonset: nithra.moonset,
    },
    phase2: {
      label: 'Phase 2 — Panchang',
      tithi,
      tithiLine: nithra.tithiLine,
      tithiEndTime,
      tithiNext: nextFromTransitions(raw.tithis, (t) => tithiTe(t.index)),
      nakshatra,
      nakshatraLine: nithra.nakshatraLine,
      nakshatraEndTime,
      nakshatraNext: nextFromTransitions(raw.nakshatras, (t) => nakshatraTe(t.index)),
      yoga,
      yogaLine: nithra.yogaLine,
      yogaEndTime,
      yogaNext: nextFromTransitions(raw.yogas, (t) => yogaTe(t.index)),
      karana,
      karanaLine: nithra.karanaLine,
      karanaEndTime,
      karanaNext: raw.karanas?.[1] ? karanaTe(raw.karanas[1].name) : null,
    },
    phase3: {
      label: 'Phase 3 — Muhurtas',
      rahuKalam: nithra.rahukalam,
      gulikaKalam: nithra.gulikakalam,
      yamagandam: nithra.yamagandam,
      abhijitMuhurtham: nithra.abhijitMuhurtham,
      durmuhurtham: nithra.durmuhurtham,
      varjyam: nithra.varjyam,
      amritaKalam: nithra.amritaGadiyalu,
      shubhaSamayamulu: nithra.shubhaSamayamulu,
    },
    phase4: {
      label: 'Phase 4 — Calendar & Festivals',
      festivals: festivals.map((f) => ({
        name: f.name,
        category: f.category,
        categoryTe: f.categoryTe,
        isFastingDay: f.isFastingDay,
      })),
      ekadashi: special.ekadashiName || (special.isEkadashi ? 'ఏకాదశి' : null),
      amavasya: special.amavasyaLabel,
      pournami: special.pournamiLabel,
      sankranti: special.sankrantiNames.length
        ? special.sankrantiNames.join(', ')
        : special.isSankranti
          ? 'సంక్రాంతి'
          : null,
      maasam,
      paksham,
      pakshaShort,
      ruthuvu,
      ayanam,
      samvatsaram,
      shraddhaTithi: nithra.shraddhaTithi,
    },
  };
}

module.exports = { buildPanchangPhases, detectSpecialDays };
