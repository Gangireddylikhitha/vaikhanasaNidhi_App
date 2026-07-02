import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLogin, useSignup } from '../hooks/useAuth';
import { mapAuthError } from '../lib/apiError';

function PasswordInput({ value, onChange, placeholder, required }) {
  return (
    <input
      type="password"
      value={value}
      onChange={onChange}
      placeholder={placeholder || '••••••••'}
      required={required}
      className="form-input"
    />
  );
}

export default function LoginPromptModal({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState('');

  const loginMutation = useLogin({
    onSuccess: () => {
      toast.success('Login successful!');
      onSuccess?.();
    },
    onError: (err) => toast.error(mapAuthError(err)),
  });

  const signupMutation = useSignup({
    onSuccess: () => {
      toast.success('Account created! Please login.');
      setMode('login');
    },
    onError: (err) => toast.error(mapAuthError(err)),
  });

  function handleLogin(e) {
    e.preventDefault();
    loginMutation.mutate({ username: username.trim(), password });
  }

  function handleSignup(e) {
    e.preventDefault();
    if (!username.trim()) return toast.error('Username is required.');
    if (password.length < 4) return toast.error('Password must be at least 4 characters.');
    if (password !== confirm) return toast.error('Passwords do not match.');
    signupMutation.mutate({ name, username: username.trim(), password });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'var(--bg-overlay)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Login required"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="corner-card rounded-2xl w-full max-w-md overflow-hidden bg-card"
        style={{ border: '1px solid var(--border-medium)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h2 className="font-telugu font-bold text-lg gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              లాగిన్ అవసరం
            </h2>
            <p className="text-xs text-muted mt-0.5 font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              లాగిన్ తర్వాత ధృవీకరణ ఫారమ్ పూరించండి
            </p>
            <p className="text-[10px] text-muted">Login first, then complete verification form</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)]" aria-label="Close">
            <X size={18} className="text-muted" />
          </button>
        </div>

        <div className="flex bg-elevated" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'login', label: 'Login', icon: LogIn },
            { id: 'signup', label: 'Sign Up', icon: UserPlus },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all"
              style={{
                background: mode === id ? 'linear-gradient(135deg, #C88F2D, #E4B24B)' : 'transparent',
                color: mode === id ? '#1a1208' : 'var(--text-muted)',
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onSubmit={handleLogin}
                className="space-y-3"
              >
                <div>
                  <label className="form-label">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    required
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" disabled={loginMutation.isPending} className="w-full py-3 btn-gold text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                  {loginMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                  {loginMutation.isPending ? 'Logging in...' : 'Login'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onSubmit={handleSignup}
                className="space-y-3"
              >
                <div>
                  <label className="form-label">Full Name (optional)</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="భక్తుడు"
                    className="form-input"
                    style={{ fontFamily: 'Tiro Telugu, serif' }}
                  />
                </div>
                <div>
                  <label className="form-label">Username *</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    required
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Password *</label>
                  <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 4 characters" required />
                </div>
                <div>
                  <label className="form-label">Confirm Password *</label>
                  <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </div>
                <button type="submit" disabled={signupMutation.isPending} className="w-full py-3 btn-gold text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                  {signupMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  {signupMutation.isPending ? 'Creating...' : 'Create Account'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
