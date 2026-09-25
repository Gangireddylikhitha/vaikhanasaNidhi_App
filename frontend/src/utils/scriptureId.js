/** MongoDB ObjectId strings are 24 hex characters. Old Firestore-era numeric ids are not. */
export function isValidScriptureId(id) {
  return typeof id === 'string' && /^[0-9a-f]{24}$/i.test(id);
}
