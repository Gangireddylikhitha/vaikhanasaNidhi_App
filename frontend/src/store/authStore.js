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

export function setAuthSession({ token, user }) {
  const session = {
    token,
    role: user.role,
    name: user.name,
    username: user.username ?? null,
    loggedIn: true,
  };
  save(session);
  return session;
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
