const KEY = 'vaikhanasa-auth';
const USERS_KEY = 'vaikhanasa-users';
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin@123' };

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getAuth() { return load(); }

// 'username' must be unique per signup
export function signup(name, username, password) {
  const users = loadUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase()))
    return 'username_taken';
  users.push({ name: name.trim() || username, username: username.trim(), password });
  saveUsers(users);
  save({ role: 'user', name: name.trim() || username, username: username.trim(), loggedIn: true });
  return true;
}

export function loginAsUser(username, password) {
  const users = loadUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return 'not_found';
  if (user.password !== password) return 'wrong_password';
  save({ role: 'user', name: user.name, username: user.username, loggedIn: true });
  return true;
}

export function continueAsGuest() {
  save({ role: 'guest', name: 'భక్తుడు', loggedIn: true });
}

export function loginAsAdmin(username, password) {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    save({ role: 'admin', name: 'Admin', loggedIn: true });
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(KEY);
}

export function isLoggedIn() { return load().loggedIn === true; }
export function isAdmin() { return load().role === 'admin'; }
