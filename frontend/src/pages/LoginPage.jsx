import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Eye, EyeOff, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { loginAsUser, loginAsAdmin, signup, continueAsGuest } from '../store/authStore';
import logo from '../assets/images/logo.png';

const GOLD = 'linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)';
const GOLD_DARK = '#8B6200';

const INPUT = {
  border: '1.5px solid #E4B24B55',
  background: 'hsl(40 43% 97%)',
  color: GOLD_DARK,
};

function PasswordInput({ value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value} onChange={onChange}
        placeholder={placeholder || '••••••••'}
        required={required}
        className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none"
        style={INPUT}
        onFocus={e => e.target.style.borderColor = '#C88F2D'}
        onBlur={e => e.target.style.borderColor = '#E4B24B55'}
      />
      <button type="button" onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: GOLD_DARK }}>{label}</label>
      {children}
    </div>
  );
}

/* ── Sign Up form ── */
function SignUpForm({ onDone, onSwitch }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  function handle(e) {
    e.preventDefault();
    setError('');
    if (!username.trim()) return setError('Username is required.');
    if (pass.length < 4) return setError('Password must be at least 4 characters.');
    if (pass !== confirm) return setError('Passwords do not match.');
    const result = signup(name, username, pass);
    if (result === 'username_taken') return setError('Username already taken. Choose another.');
    onDone('user');
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <Field label="Full Name (optional)">
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="భక్తుడు"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{ ...INPUT, fontFamily: 'Tiro Telugu, serif' }}
          onFocus={e => e.target.style.borderColor = '#C88F2D'}
          onBlur={e => e.target.style.borderColor = '#E4B24B55'} />
      </Field>
      <Field label="Username *">
        <input value={username} onChange={e => setUsername(e.target.value)}
          placeholder="your_username" required
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={INPUT}
          onFocus={e => e.target.style.borderColor = '#C88F2D'}
          onBlur={e => e.target.style.borderColor = '#E4B24B55'} />
      </Field>
      <Field label="Password *">
        <PasswordInput value={pass} onChange={e => setPass(e.target.value)}
          placeholder="Min. 4 characters" required />
      </Field>
      <Field label="Confirm Password *">
        <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)}
          placeholder="Repeat password" required />
      </Field>

      {error && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <button type="submit"
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all"
        style={{ background: GOLD, color: GOLD_DARK }}>
        <UserPlus size={16} /> Create Account
      </button>

      <p className="text-center text-xs text-gray-400">
        Already have an account?{' '}
        <button type="button" onClick={() => onSwitch('login')}
          className="font-semibold underline" style={{ color: GOLD_DARK }}>
          Login
        </button>
      </p>
    </form>
  );
}

/* ── User Login form ── */
function UserLoginForm({ onDone, onSwitch }) {
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  function handle(e) {
    e.preventDefault();
    setError('');
    const result = loginAsUser(username.trim(), pass);
    if (result === 'not_found') return setError('No account found with that username.');
    if (result === 'wrong_password') return setError('Incorrect password. Try again.');
    onDone('user');
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <Field label="Username">
        <input value={username} onChange={e => setUsername(e.target.value)}
          placeholder="your_username" required
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={INPUT}
          onFocus={e => e.target.style.borderColor = '#C88F2D'}
          onBlur={e => e.target.style.borderColor = '#E4B24B55'} />
      </Field>
      <Field label="Password">
        <PasswordInput value={pass} onChange={e => setPass(e.target.value)} required />
      </Field>

      {error && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <button type="submit"
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all"
        style={{ background: GOLD, color: GOLD_DARK }}>
        <LogIn size={16} /> Login
      </button>

      <p className="text-center text-xs text-gray-400">
        New here?{' '}
        <button type="button" onClick={() => onSwitch('signup')}
          className="font-semibold underline" style={{ color: GOLD_DARK }}>
          Create an account
        </button>
      </p>
    </form>
  );
}

/* ── Admin Login form ── */
function AdminLoginForm({ onDone }) {
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  function handle(e) {
    e.preventDefault();
    setError('');
    if (loginAsAdmin(username.trim(), pass)) onDone('admin');
    else setError('Invalid credentials.');
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <Field label="Admin Username">
        <input value={username} onChange={e => setUsername(e.target.value)}
          placeholder="admin" required
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={INPUT}
          onFocus={e => e.target.style.borderColor = '#C88F2D'}
          onBlur={e => e.target.style.borderColor = '#E4B24B55'} />
      </Field>
      <Field label="Password">
        <PasswordInput value={pass} onChange={e => setPass(e.target.value)} required />
      </Field>

      {error && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <button type="submit"
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all"
        style={{ background: GOLD, color: GOLD_DARK }}>
        <Shield size={16} /> Login as Admin
      </button>
      <p className="text-center text-xs text-gray-400">
        Default: <span className="font-mono font-semibold">admin</span> / <span className="font-mono font-semibold">admin@123</span>
      </p>
    </form>
  );
}

/* ── Main ── */
export default function LoginPage({ onLogin }) {
  // mode: 'signup' | 'login' | 'admin'
  const [mode, setMode] = useState('login');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  function handleLogoTap() {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) {
      setAdminUnlocked(true);
      setMode('admin');
      setTapCount(0);
    }
  }

  const tabs = [
    { id: 'signup', label: 'Sign Up', icon: UserPlus },
    { id: 'login',  label: 'Login',   icon: LogIn },
    ...(adminUnlocked ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'hsl(40 43% 95%)', backgroundImage: "url('/bg-pattern.svg')", backgroundRepeat: 'repeat', backgroundSize: '220px' }}>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-7 gap-3">
          <button
            onClick={handleLogoTap}
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl overflow-hidden select-none focus:outline-none active:scale-95 transition-transform"
            style={{ background: GOLD }}
            title="">
            <img src={logo} alt="logo" className="w-12 h-12 object-contain pointer-events-none" />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-3xl" style={{ fontFamily: 'Tiro Telugu, serif', color: GOLD_DARK }}>
              వైఖానస నిధి
            </h1>
            <p className="text-sm text-gray-500 mt-1">Sacred Library</p>
            {tapCount > 0 && tapCount < 5 && (
              <motion.p
                key={tapCount}
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-xs mt-1" style={{ color: '#C88F2D99' }}>
                {'● '.repeat(tapCount).trim()}
              </motion.p>
            )}
            {adminUnlocked && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs mt-1 font-semibold" style={{ color: '#C88F2D' }}>
                Admin access unlocked
              </motion.p>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ border: '1px solid #E4B24B33' }}>

          {/* Tabs */}
          <div className="flex" style={{ background: 'hsl(40 43% 95%)' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setMode(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold transition-all"
                style={{
                  background: mode === id ? GOLD : 'transparent',
                  color: mode === id ? GOLD_DARK : '#9ca3af',
                }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <div className="p-7">
            <AnimatePresence mode="wait">
              <motion.div key={mode}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                {mode === 'signup' && <SignUpForm onDone={onLogin} onSwitch={setMode} />}
                {mode === 'login'  && <UserLoginForm onDone={onLogin} onSwitch={setMode} />}
                {mode === 'admin'  && <AdminLoginForm onDone={onLogin} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Guest access */}
        <button onClick={() => { continueAsGuest(); onLogin('user'); }}
          className="w-full flex items-center justify-center gap-2 mt-4 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95 bg-white/70 hover:bg-white"
          style={{ color: GOLD_DARK, border: '1.5px solid #E4B24B44' }}>
          <ArrowRight size={15} /> Continue without Login
        </button>
      </motion.div>
    </div>
  );
}
