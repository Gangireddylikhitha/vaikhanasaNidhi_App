import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Eye, EyeOff, LogIn, UserPlus, ArrowRight,
  Loader2, KeyRound, Mail, ArrowLeft, CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useSignup,
  useLogin,
  useAdminLogin,
  useGuestLogin,
  useChangePasswordLogin,
  useForgotPasswordLookup,
  useForgotPasswordSendOtp,
  useForgotPasswordReset,
} from '../hooks/useAuth';
import { mapAuthError, getApiError } from '../lib/apiError';
import ThemeToggle from '../components/ThemeToggle';
import { brandLogo as logo } from '../constants/brandAssets';

function PasswordInput({ value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder || '••••••••'}
        required={required}
        className="form-input pr-11"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
      >
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

function SignUpForm({ onSwitch, onSignupSuccess }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');

  const signupMutation = useSignup({
    onSuccess: (_data, variables) => {
      toast.success('ఖాతా సృష్టించబడింది! ముందు లాగిన్ అవ్వండి, తర్వాత ధృవీకరణ ఫారమ్ పూరించండి.');
      onSignupSuccess?.({ username: variables.username.trim().toLowerCase() });
      onSwitch('login');
    },
    onError: (err) => toast.error(mapAuthError(err)),
  });

  function handle(e) {
    e.preventDefault();
    if (!username.trim()) return toast.error('Username is required.');
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return toast.error('Please enter a valid email address.');
    }
    if (pass.length < 4) return toast.error('Password must be at least 4 characters.');
    if (pass !== confirm) return toast.error('Passwords do not match.');

    signupMutation.mutate({
      name,
      username,
      email: email.trim() || undefined,
      password: pass,
    });
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <Field label="Full Name (optional)">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="భక్తుడు"
          className="form-input"
          style={{ fontFamily: 'Tiro Telugu, serif' }}
        />
      </Field>
      <Field label="Username *">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your_username"
          required
          className="form-input"
        />
      </Field>
      <Field label="Email Address (for password recovery)">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="form-input"
        />
      </Field>
      <Field label="Password *">
        <PasswordInput
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Min. 4 characters"
          required
        />
      </Field>
      <Field label="Confirm Password *">
        <PasswordInput
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat password"
          required
        />
      </Field>
      <button
        type="submit"
        disabled={signupMutation.isPending}
        className="w-full flex items-center justify-center gap-2 py-3.5 btn-gold text-sm disabled:opacity-60"
      >
        {signupMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
        {signupMutation.isPending ? 'Creating...' : 'Create Account'}
      </button>
      <p className="text-center text-xs text-muted">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => onSwitch('login')}
          className="font-semibold underline gold-glow"
        >
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
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your_username"
          required
          className="form-input"
        />
      </Field>
      <Field label="Old Password *">
        <PasswordInput value={oldPass} onChange={(e) => setOldPass(e.target.value)} required />
      </Field>
      <Field label="New Password *">
        <PasswordInput
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          placeholder="Min. 4 characters"
          required
        />
      </Field>
      <Field label="Confirm New Password *">
        <PasswordInput
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          placeholder="Repeat new password"
          required
        />
      </Field>
      <button
        type="submit"
        disabled={changePasswordMutation.isPending}
        className="w-full flex items-center justify-center gap-2 py-3.5 btn-gold text-sm disabled:opacity-60"
      >
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

function ForgotPasswordForm({ onBack, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Lookup | 2: Enter Email & Send OTP | 3: Verify OTP & Reset
  const [identifier, setIdentifier] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const lookupMutation = useForgotPasswordLookup({
    onSuccess: (data) => {
      setUserInfo(data);
      if (data.email) {
        setEmail(data.email);
      }
      setStep(2);
    },
    onError: (err) => toast.error(getApiError(err, 'Could not find account.')),
  });

  const sendOtpMutation = useForgotPasswordSendOtp({
    onSuccess: (data) => {
      toast.success(data.message || 'OTP sent to your email!');
      setStep(3);
    },
    onError: (err) => toast.error(getApiError(err, 'Failed to send OTP.')),
  });

  const resetMutation = useForgotPasswordReset({
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset successful!');
      onSuccess?.(data.username || userInfo?.username || '');
    },
    onError: (err) => toast.error(getApiError(err, 'Password reset failed.')),
  });

  function handleLookup(e) {
    e.preventDefault();
    if (!identifier.trim()) {
      return toast.error('Please enter your username or phone number.');
    }
    lookupMutation.mutate({ identifier: identifier.trim() });
  }

  function handleSendOtp(e) {
    e.preventDefault();
    if (!email.trim()) {
      return toast.error('Please enter a valid email address.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return toast.error('Please enter a valid email address format.');
    }
    sendOtpMutation.mutate({
      identifier: identifier.trim(),
      email: email.trim(),
    });
  }

  function handleReset(e) {
    e.preventDefault();
    if (!otp.trim()) return toast.error('Please enter the 6-digit OTP.');
    if (newPass.length < 4) return toast.error('Password must be at least 4 characters.');
    if (newPass !== confirmPass) return toast.error('Passwords do not match.');

    resetMutation.mutate({
      identifier: identifier.trim(),
      email: email.trim(),
      otp: otp.trim(),
      new_password: newPass,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <KeyRound size={16} className="text-primary-gold" />
          <h3 className="font-semibold text-sm gold-glow">Reset Password</h3>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-muted hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={13} /> Back
        </button>
      </div>

      {step === 1 && (
        <form onSubmit={handleLookup} className="space-y-4">
          <p className="text-xs text-muted">
            Enter your <strong>Username</strong> or registered <strong>Phone number</strong> to find your account.
          </p>
          <Field label="Username or Phone Number *">
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. username or 9876543210"
              required
              className="form-input"
            />
          </Field>
          <button
            type="submit"
            disabled={lookupMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 btn-gold text-sm disabled:opacity-60"
          >
            {lookupMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />}
            {lookupMutation.isPending ? 'Finding Account...' : 'Continue'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="p-3 rounded-xl bg-elevated border border-[var(--border-subtle)] text-xs space-y-1">
            <p className="text-muted">
              Account found for: <strong className="gold-glow">{userInfo?.name || userInfo?.username}</strong>
            </p>
            <p className="text-muted">
              Username: <span className="font-mono">{userInfo?.username}</span>
            </p>
          </div>

          <Field label="Email Address to receive OTP *">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="form-input"
            />
            {!userInfo?.hasEmail && (
              <p className="text-[11px] text-muted mt-1">
                No email was saved on this account previously. We will verify and save this email to your profile.
              </p>
            )}
          </Field>

          <button
            type="submit"
            disabled={sendOtpMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 btn-gold text-sm disabled:opacity-60"
          >
            {sendOtpMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            {sendOtpMutation.isPending ? 'Sending OTP...' : 'Send OTP via Email'}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-center text-xs text-muted hover:text-white"
          >
            Change username or phone number
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="p-3 rounded-xl bg-elevated border border-[var(--border-subtle)] text-xs text-muted">
            OTP sent to: <strong className="text-body font-mono">{email}</strong>
          </div>

          <Field label="Enter 6-Digit OTP *">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              required
              className="form-input text-center text-lg tracking-[0.35em] font-mono font-bold"
            />
          </Field>

          <Field label="New Password *">
            <PasswordInput
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Min. 4 characters"
              required
            />
          </Field>

          <Field label="Confirm New Password *">
            <PasswordInput
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Repeat new password"
              required
            />
          </Field>

          <button
            type="submit"
            disabled={resetMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 btn-gold text-sm disabled:opacity-60"
          >
            {resetMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {resetMutation.isPending ? 'Updating Password...' : 'Reset Password'}
          </button>

          <div className="flex justify-between items-center text-xs text-muted">
            <button
              type="button"
              disabled={sendOtpMutation.isPending}
              onClick={handleSendOtp}
              className="gold-glow underline"
            >
              {sendOtpMutation.isPending ? 'Resending...' : 'Resend OTP'}
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="hover:text-white underline"
            >
              Change Email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function UserLoginForm({ onDone, onSwitch, successMessage, initialUsername = '' }) {
  const [view, setView] = useState('login'); // 'login' | 'change-password' | 'forgot-password'
  const [identifier, setIdentifier] = useState(initialUsername);
  const [pass, setPass] = useState('');

  useEffect(() => {
    if (initialUsername) setIdentifier(initialUsername);
  }, [initialUsername]);

  const loginMutation = useLogin({
    onSuccess: () => {
      toast.success('Login successful!');
      onDone();
    },
    onError: (err) => toast.error(mapAuthError(err)),
  });

  function handle(e) {
    e.preventDefault();
    loginMutation.mutate({ username: identifier.trim(), password: pass });
  }

  if (view === 'change-password') {
    return <ChangePasswordForm onBack={() => setView('login')} />;
  }

  if (view === 'forgot-password') {
    return (
      <ForgotPasswordForm
        onBack={() => setView('login')}
        onSuccess={(recoveredUsername) => {
          if (recoveredUsername) setIdentifier(recoveredUsername);
          setView('login');
        }}
      />
    );
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <Field label="Username / Email / Phone">
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="username, email, or phone"
          required
          className="form-input"
        />
      </Field>
      <Field label="Password">
        <PasswordInput value={pass} onChange={(e) => setPass(e.target.value)} required />
      </Field>
      {successMessage && <p className="text-sm text-center gold-glow">{successMessage}</p>}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full flex items-center justify-center gap-2 py-3.5 btn-gold text-sm disabled:opacity-60"
      >
        {loginMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>

      <div className="flex items-center justify-between text-xs text-muted pt-1">
        <button
          type="button"
          onClick={() => setView('forgot-password')}
          className="font-semibold underline gold-glow"
        >
          Forgot Password?
        </button>
        <button
          type="button"
          onClick={() => setView('change-password')}
          className="font-semibold underline text-muted hover:text-white transition-colors"
        >
          Change password
        </button>
      </div>

      <p className="text-center text-xs text-muted pt-1">
        New here?{' '}
        <button
          type="button"
          onClick={() => onSwitch('signup')}
          className="font-semibold underline gold-glow"
        >
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
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin"
          required
          className="form-input"
        />
      </Field>
      <Field label="Password">
        <PasswordInput value={pass} onChange={(e) => setPass(e.target.value)} required />
      </Field>
      <button
        type="submit"
        disabled={adminLogin.isPending}
        className="w-full flex items-center justify-center gap-2 py-3.5 btn-gold text-sm disabled:opacity-60"
      >
        {adminLogin.isPending ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
        {adminLogin.isPending ? 'Logging in...' : 'Login as Admin'}
      </button>
      <p className="text-center text-xs text-muted">
        Default: <span className="font-mono font-semibold gold-glow">admin</span> /{' '}
        <span className="font-mono font-semibold gold-glow">admin@123</span>
      </p>
    </form>
  );
}

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [loginMessage, setLoginMessage] = useState('');
  const [loginUsername, setLoginUsername] = useState('');

  const guestLoginMutation = useGuestLogin({
    onSuccess: () => {
      toast.success('Welcome! Continuing as guest.');
      onLogin();
    },
    onError: (err) => toast.error(mapAuthError(err)),
  });

  function handleSignupSuccess({ username }) {
    setLoginUsername(username);
    setLoginMessage('Account created! Please login first, then complete the verification form.');
  }

  function handleModeChange(nextMode) {
    if (nextMode !== 'login') setLoginMessage('');
    setMode(nextMode);
  }

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
    { id: 'login', label: 'Login', icon: LogIn },
    ...(adminUnlocked ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <div
      className="login-shell min-h-dvh flex flex-col page-bg relative sm:items-center sm:justify-center sm:p-4"
      style={{ backgroundImage: 'var(--hero-glow)' }}
    >
      <div className="absolute top-4 right-4 z-10 safe-top-offset">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-panel w-full flex-1 flex flex-col justify-center max-w-md mx-auto px-0 sm:px-0 sm:flex-none"
      >
        <div className="login-brand flex flex-col items-center mb-5 sm:mb-7 gap-3 px-5 pt-4 sm:px-0 sm:pt-0">
          <button
            onClick={handleLogoTap}
            className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden select-none focus:outline-none active:scale-95 transition-transform corner-card"
            style={{ boxShadow: '0 0 30px rgba(200,143,45,0.3)' }}
          >
            <img src={logo} alt="logo" className="w-12 h-12 object-contain pointer-events-none" />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-3xl gold-glow-strong" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              వైఖానస నిధి
            </h1>
            <p className="text-sm text-muted mt-1">Sacred Library</p>
            {tapCount > 0 && tapCount < 5 && (
              <motion.p
                key={tapCount}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs mt-1 text-muted"
              >
                {'● '.repeat(tapCount).trim()}
              </motion.p>
            )}
            {adminUnlocked && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs mt-1 font-semibold gold-glow">
                Admin access unlocked
              </motion.p>
            )}
          </div>
        </div>

        <div
          className="login-card corner-card overflow-hidden bg-card flex-1 flex flex-col min-h-0 sm:flex-none sm:rounded-3xl"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex bg-elevated" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleModeChange(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold transition-all"
                style={{
                  background: mode === id ? 'linear-gradient(135deg, #C88F2D, #E4B24B)' : 'transparent',
                  color: mode === id ? 'var(--bg-page)' : 'var(--text-muted)',
                }}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-7 bg-card flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                {mode === 'signup' && (
                  <SignUpForm onSwitch={handleModeChange} onSignupSuccess={handleSignupSuccess} />
                )}
                {mode === 'login' && (
                  <UserLoginForm
                    onDone={onLogin}
                    onSwitch={handleModeChange}
                    successMessage={loginMessage}
                    initialUsername={loginUsername}
                  />
                )}
                {mode === 'admin' && <AdminLoginForm onDone={onLogin} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={() => guestLoginMutation.mutate()}
          disabled={guestLoginMutation.isPending}
          className="login-guest-btn w-full flex items-center justify-center gap-2 mt-4 py-3.5 rounded-2xl text-sm font-semibold btn-ghost active:scale-95 disabled:opacity-60 mx-5 sm:mx-0 mb-5 sm:mb-0 safe-bottom-offset"
        >
          {guestLoginMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
          {guestLoginMutation.isPending ? 'Please wait...' : 'Continue without Login'}
        </button>
      </motion.div>
    </div>
  );
}
