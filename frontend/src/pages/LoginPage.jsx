import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Eye, EyeOff, LogIn, UserPlus, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useSignup, useLogin, useAdminLogin, useGuestLogin, useChangePasswordLogin } from '../hooks/useAuth';
import { mapAuthError } from '../lib/apiError';
import ThemeToggle from '../components/ThemeToggle';
import logo from '../assets/images/logo.png';

function PasswordInput({ value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value} onChange={onChange}
        placeholder={placeholder || '••••••••'}
        required={required}
        className="form-input pr-11"
      />
      <button type="button" onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function SignUpForm({ onSwitch, onDone }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');

  const signupMutation = useSignup({
    onSuccess: () => {
      toast.success('ఖాతా సృష్టించబడింది! ధృవీకరణ ఫారమ్ పూరించండి.');
      onDone?.();
    },
    onError: (err) => toast.error(mapAuthError(err)),
  });

  function handle(e) {
    e.preventDefault();
    if (!username.trim()) return toast.error('Username is required.');
    if (pass.length < 4) return toast.error('Password must be at least 4 characters.');
    if (pass !== confirm) return toast.error('Passwords do not match.');
    signupMutation.mutate({ name, username, password: pass });
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <Field label="Full Name (optional)">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="భక్తుడు"
          className="form-input" style={{ fontFamily: 'Tiro Telugu, serif' }} />
      </Field>
      <Field label="Username *">
        <input value={username} onChange={e => setUsername(e.target.value)}
          placeholder="your_username" required className="form-input" />
      </Field>
      <Field label="Password *">
        <PasswordInput value={pass} onChange={e => setPass(e.target.value)} placeholder="Min. 4 characters" required />
      </Field>
      <Field label="Confirm Password *">
        <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required />
      </Field>
      <button type="submit" disabled={signupMutation.isPending}
        className="w-full flex items-center justify-center gap-2 py-3.5 btn-gold text-sm disabled:opacity-60">
        {signupMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
        {signupMutation.isPending ? 'Creating...' : 'Create Account'}
      </button>
      <p className="text-center text-xs text-muted">
        Already have an account?{' '}
        <button type="button" onClick={() => onSwitch('login')} className="font-semibold underline gold-glow">
          Login
        </button>
      </p>
    </form>
  );
}

function ChangePasswordForm({ onBack }) {
  const [username, setUsername] = useState('');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const changePasswordMutation = useChangePasswordLogin({
    onSuccess: () => {
      toast.success('Password changed! Please login with your new password.');
      onBack();
    },
    onError: (err) => toast.error(mapAuthError(err)),
  });

  function handle(e) {
    e.preventDefault();
    if (!username.trim()) return toast.error('Username is required.');
    if (newPass.length < 4) return toast.error('New password must be at least 4 characters.');
    if (newPass !== confirmPass) return toast.error('New passwords do not match.');
    changePasswordMutation.mutate({
      username: username.trim(),
      current_password: oldPass,
      new_password: newPass,
    });
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound size={16} className="text-primary-gold" />
        <h3 className="font-semibold text-sm gold-glow">Change Password</h3>
      </div>
      <Field label="Username *">
        <input value={username} onChange={(e) => setUsername(e.target.value)}
          placeholder="your_username" required className="form-input" />
      </Field>
      <Field label="Old Password *">
        <PasswordInput value={oldPass} onChange={(e) => setOldPass(e.target.value)} required />
      </Field>
      <Field label="New Password *">
        <PasswordInput value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Min. 4 characters" required />
      </Field>
      <Field label="Confirm New Password *">
        <PasswordInput value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Repeat new password" required />
      </Field>
      <button type="submit" disabled={changePasswordMutation.isPending}
        className="w-full flex items-center justify-center gap-2 py-3.5 btn-gold text-sm disabled:opacity-60">
        {changePasswordMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
        {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
      </button>
      <p className="text-center text-xs text-muted">
        <button type="button" onClick={onBack} className="font-semibold underline gold-glow">
          Back to Login
        </button>
      </p>
    </form>
  );
}

function UserLoginForm({ onDone, onSwitch, successMessage }) {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');

  const loginMutation = useLogin({
    onSuccess: () => {
      toast.success('Login successful!');
      onDone();
    },
    onError: (err) => toast.error(mapAuthError(err)),
  });

  function handle(e) {
    e.preventDefault();
    loginMutation.mutate({ username: username.trim(), password: pass });
  }

  if (showChangePassword) {
    return <ChangePasswordForm onBack={() => setShowChangePassword(false)} />;
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <Field label="Username">
        <input value={username} onChange={e => setUsername(e.target.value)}
          placeholder="your_username" required className="form-input" />
      </Field>
      <Field label="Password">
        <PasswordInput value={pass} onChange={e => setPass(e.target.value)} required />
      </Field>
      {successMessage && <p className="text-sm text-center gold-glow">{successMessage}</p>}
      <button type="submit" disabled={loginMutation.isPending}
        className="w-full flex items-center justify-center gap-2 py-3.5 btn-gold text-sm disabled:opacity-60">
        {loginMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>
      <p className="text-center text-xs text-muted">
        <button type="button" onClick={() => setShowChangePassword(true)} className="font-semibold underline gold-glow">
          Change password
        </button>
      </p>
      <p className="text-center text-xs text-muted">
        New here?{' '}
        <button type="button" onClick={() => onSwitch('signup')} className="font-semibold underline gold-glow">
          Create an account
        </button>
      </p>
    </form>
  );
}

function AdminLoginForm({ onDone }) {
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');

  const adminLogin = useAdminLogin({
    onSuccess: () => {
      toast.success('Admin login successful!');
      onDone();
    },
    onError: (err) => toast.error(mapAuthError(err)),
  });

  function handle(e) {
    e.preventDefault();
    adminLogin.mutate({ username: username.trim(), password: pass });
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <Field label="Admin Username">
        <input value={username} onChange={e => setUsername(e.target.value)}
          placeholder="admin" required className="form-input" />
      </Field>
      <Field label="Password">
        <PasswordInput value={pass} onChange={e => setPass(e.target.value)} required />
      </Field>
      <button type="submit" disabled={adminLogin.isPending}
        className="w-full flex items-center justify-center gap-2 py-3.5 btn-gold text-sm disabled:opacity-60">
        {adminLogin.isPending ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
        {adminLogin.isPending ? 'Logging in...' : 'Login as Admin'}
      </button>
      <p className="text-center text-xs text-muted">
        Default: <span className="font-mono font-semibold gold-glow">admin</span> / <span className="font-mono font-semibold gold-glow">admin@123</span>
      </p>
    </form>
  );
}

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [loginMessage, setLoginMessage] = useState('');

  const guestLoginMutation = useGuestLogin({
    onSuccess: () => {
      toast.success('Welcome! Continuing as guest.');
      onLogin();
    },
    onError: (err) => toast.error(mapAuthError(err)),
  });

  function handleModeChange(nextMode) {
    if (nextMode !== 'login') setLoginMessage('');
    setMode(nextMode);
  }

  function handleLogoTap() {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) { setAdminUnlocked(true); setMode('admin'); setTapCount(0); }
  }

  const tabs = [
    { id: 'signup', label: 'Sign Up', icon: UserPlus },
    { id: 'login',  label: 'Login',   icon: LogIn },
    ...(adminUnlocked ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 page-bg relative"
      style={{ backgroundImage: 'var(--hero-glow)' }}>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">

        <div className="flex flex-col items-center mb-7 gap-3">
          <button onClick={handleLogoTap}
            className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden select-none focus:outline-none active:scale-95 transition-transform corner-card"
            style={{ boxShadow: '0 0 30px rgba(200,143,45,0.3)' }}>
            <img src={logo} alt="logo" className="w-12 h-12 object-contain pointer-events-none" />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-3xl gold-glow-strong" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              వైఖానస నిధి
            </h1>
            <p className="text-sm text-muted mt-1">Sacred Library</p>
            {tapCount > 0 && tapCount < 5 && (
              <motion.p key={tapCount} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs mt-1 text-muted">{'● '.repeat(tapCount).trim()}</motion.p>
            )}
            {adminUnlocked && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs mt-1 font-semibold gold-glow">
                Admin access unlocked
              </motion.p>
            )}
          </div>
        </div>

        <div className="corner-card rounded-3xl overflow-hidden bg-card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div className="flex bg-elevated" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => handleModeChange(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold transition-all"
                style={{
                  background: mode === id ? 'linear-gradient(135deg, #C88F2D, #E4B24B)' : 'transparent',
                  color: mode === id ? 'var(--bg-page)' : 'var(--text-muted)',
                }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <div className="p-7 bg-card">
            <AnimatePresence mode="wait">
              <motion.div key={mode}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                {mode === 'signup' && (
                  <SignUpForm
                    onSwitch={handleModeChange}
                    onDone={onLogin}
                  />
                )}
                {mode === 'login' && (
                  <UserLoginForm
                    onDone={onLogin}
                    onSwitch={handleModeChange}
                    successMessage={loginMessage}
                  />
                )}
                {mode === 'admin'  && <AdminLoginForm onDone={onLogin} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <button onClick={() => guestLoginMutation.mutate()} disabled={guestLoginMutation.isPending}
          className="w-full flex items-center justify-center gap-2 mt-4 py-3.5 rounded-2xl text-sm font-semibold btn-ghost active:scale-95 disabled:opacity-60">
          {guestLoginMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
          {guestLoginMutation.isPending ? 'Please wait...' : 'Continue without Login'}
        </button>
      </motion.div>
    </div>
  );
}
