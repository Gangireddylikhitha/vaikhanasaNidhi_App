/** Static Vishnu Sahasranamam routes — frontend `sahasraNamalu.js` only. */
export function sahasranamTodayPath() {
  return '/sahasranamam/today';
}

export function sahasranamAllPath() {
  return '/sahasranamam';
}

/** @deprecated Use sahasranamTodayPath / sahasranamAllPath */
export function sahasranamBrowsePath() {
  return sahasranamAllPath();
}

/** @deprecated Use sahasranamAllPath — full text is static, not API /read */
export function sahasranamReadPath() {
  return sahasranamAllPath();
}
