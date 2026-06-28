import { VISHNU_SAHASRANAMA_SLOKAS } from "../data/sahasraNamalu";

/** Local calendar day number — rolls over at 12:00 AM in the user's timezone */
function getLocalDayNumber() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor(now.getTime() / 86_400_000);
}

function getDailyIndex() {
  return getLocalDayNumber() % VISHNU_SAHASRANAMA_SLOKAS.length;
}

/** Today's Vishnu Sahasranama śloka — one per calendar day, cycles through all 108 */
export function getDailySahasranamaSloka() {
  return VISHNU_SAHASRANAMA_SLOKAS[getDailyIndex()];
}

/** Śloka number 1–108 for UI labels */
export function getDailySahasranamaIndex() {
  return getDailyIndex() + 1;
}

/** Milliseconds until next local midnight */
export function msUntilMidnight() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next - now;
}
