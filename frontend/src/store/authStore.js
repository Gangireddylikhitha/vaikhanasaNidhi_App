const KEY = 'vaikhanasa-auth';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getAuth() {
  return load();
}

export function getToken() {
  return load().token || null;
}

export function getRefreshToken() {
  return load().refreshToken || null;
}

export function setAuthSession({ token, refreshToken, user }) {
  const prev = load();
  const session = {
    token,
    // Preserve the existing refresh token when a caller only refreshes the
    // profile (e.g. verification update) without a new refresh token.
    refreshToken: refreshToken ?? prev.refreshToken ?? null,
    role: user.role,
    name: user.name,
    username: user.username ?? null,
    verification_status: user.verification_status || 'none',
    loggedIn: true,
  };
  save(session);
  notifyVerificationChange(session.verification_status);
  return session;
}

// Silently swap in a freshly minted token pair without touching the rest of
// the session (used by the axios auto-refresh flow).
export function updateTokens({ token, refreshToken }) {
  const auth = load();
  if (!auth.loggedIn) return;
  save({
    ...auth,
    token: token ?? auth.token,
    refreshToken: refreshToken ?? auth.refreshToken,
  });
}

export function clearAuthSession() {
  localStorage.removeItem(KEY);
}

export function logout() {
  clearAuthSession();
}

export function isLoggedIn() {
  const auth = load();
  return auth.loggedIn === true && !!auth.token;
}

export function isAdmin() {
  return load().role === 'admin';
}

export function isGuest() {
  return load().role === 'guest';
}

export function isRegisteredUser() {
  const auth = load();
  return auth.loggedIn === true && !!auth.token && auth.role !== 'guest';
}

export function isVerifiedUser() {
  const auth = load();
  return isRegisteredUser() && auth.verification_status === 'approved';
}

export function getVerificationStatus() {
  return load().verification_status || 'none';
}

export function updateVerificationStatus(status) {
  const auth = load();
  if (!auth.loggedIn) return;
  save({ ...auth, verification_status: status });
  notifyVerificationChange(status);
}

function notifyVerificationChange(status) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('auth:verification', { detail: { status } }));
}
