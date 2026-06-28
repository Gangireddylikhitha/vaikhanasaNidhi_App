import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Bell, Shield, HelpCircle, ChevronRight, Palette, Moon, Sun } from 'lucide-react';
import { getSettings, saveSettings } from '../store/useAppStore';
import { useUserSettings, useSettingsActions } from '../hooks/useUserData';
import { applyTheme } from '../lib/theme';

const FONT_OPTIONS = [
  { id: 'small', label: 'S' },
  { id: 'medium', label: 'M' },
  { id: 'large', label: 'L' },
  { id: 'xlarge', label: 'XL' },
];

const COLOR_OPTIONS_DARK = [
  { id: 'standard', label: 'Standard', sample: '#E4B24B', desc: 'Classic gold' },
  { id: 'bright', label: 'Bright', sample: '#F6D67A', desc: 'Easier to read' },
  { id: 'maximum', label: 'Maximum', sample: '#FFF8E7', desc: 'Highest contrast' },
];

const COLOR_OPTIONS_LIGHT = [
  { id: 'standard', label: 'Standard', sample: '#8B6914', desc: 'Classic gold' },
  { id: 'bright', label: 'Bright', sample: '#9A7209', desc: 'Easier to read' },
  { id: 'maximum', label: 'Maximum', sample: '#2D2200', desc: 'Highest contrast' },
];

export default function SettingsDrawer({ open, onClose }) {
  const { data: serverSettings } = useUserSettings();
  const settingsMutation = useSettingsActions();
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    if (open) {
      const next = serverSettings || getSettings();
      setSettings(next);
      saveSettings(next);
      applyTheme(next);
    }
  }, [open, serverSettings]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  function update(key, val) {
    const next = { ...settings, [key]: val };
    setSettings(next);
    saveSettings(next);
    applyTheme(next);
    settingsMutation.mutate(next);
  }

  const colorOptions = settings.themeMode === 'light' ? COLOR_OPTIONS_LIGHT : COLOR_OPTIONS_DARK;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="settings-overlay"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="settings-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
          >
            <div className="settings-drawer-header flex items-center justify-between">
              <h2 className="font-semibold text-scale-lg gold-glow" style={{ fontFamily: 'Playfair Display, serif' }}>
                Settings
              </h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-elevated text-muted hover:opacity-80 transition-opacity"
                style={{ border: '1px solid var(--border-subtle)' }}
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            <div className="settings-drawer-body">
              <Section title="Appearance">
                <div className="settings-block">
                  <div className="settings-row-label">
                    {settings.themeMode === 'dark' ? <Moon size={18} className="text-muted" /> : <Sun size={18} className="text-muted" />}
                    <span className="text-scale-sm text-body font-medium">Theme</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => update('themeMode', 'dark')}
                      className={`theme-pill flex items-center justify-center gap-2 py-3 rounded-xl text-scale-sm font-bold ${settings.themeMode === 'dark' ? 'active' : ''}`}
                    >
                      <Moon size={14} /> Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => update('themeMode', 'light')}
                      className={`theme-pill flex items-center justify-center gap-2 py-3 rounded-xl text-scale-sm font-bold ${settings.themeMode === 'light' ? 'active' : ''}`}
                    >
                      <Sun size={14} /> Light
                    </button>
                  </div>
                  <p className="text-scale-xs text-muted mt-2 text-center">
                    {settings.themeMode === 'dark' ? 'Black background with gold glow' : 'White background with gold glow'}
                  </p>
                </div>
              </Section>

              <Section title="Reading">
                <div className="settings-block">
                  <div className="settings-row-label">
                    <Type size={18} className="text-muted" />
                    <span className="text-scale-sm text-body font-medium">Font size</span>
                  </div>
                  <div className="flex gap-2">
                    {FONT_OPTIONS.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => update('fontSize', s.id)}
                        className={`flex-1 py-2.5 rounded-lg text-scale-sm font-bold transition-all theme-pill ${settings.fontSize === s.id ? 'active' : ''}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-block">
                  <div className="settings-row-label">
                    <Palette size={18} className="text-muted" />
                    <span className="text-scale-sm text-body font-medium">Text brightness</span>
                  </div>
                  <div className="space-y-2">
                    {colorOptions.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => update('textColor', opt.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left bg-elevated"
                        style={{
                          border: settings.textColor === opt.id ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
                          background: settings.textColor === opt.id ? 'var(--hover-bg)' : 'var(--bg-elevated)',
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          style={{ background: opt.sample, boxShadow: `0 0 8px ${opt.sample}66` }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-scale-sm font-semibold text-body">{opt.label}</p>
                          <p className="text-scale-xs text-muted">{opt.desc}</p>
                        </div>
                        {settings.textColor === opt.id && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#C88F2D' }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-block pb-4">
                  <div className="gold-card p-3 rounded-xl" style={{ boxShadow: '0 4px 16px rgba(200,143,45,0.1)' }}>
                    <p className="text-scale-xs uppercase tracking-wider text-muted mb-2">Preview</p>
                    <p className="font-telugu gold-glow-strong text-scale-base mb-1" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                      ఓం నమో నారాయణాయ
                    </p>
                    <p className="font-telugu reading-meaning text-scale-sm" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                      Salutations to Lord Narayana
                    </p>
                  </div>
                </div>
              </Section>

              <Section title="Notifications">
                <ToggleRow icon={Bell} label="Daily sloka" value={settings.notifyDailySloka}
                  onChange={v => update('notifyDailySloka', v)} />
                <ToggleRow icon={Bell} label="Panchangam" value={settings.notifyPanchangam}
                  onChange={v => update('notifyPanchangam', v)} />
              </Section>

              <Section title="About">
                <LinkRow icon={Shield} label="Privacy policy" />
                <LinkRow icon={HelpCircle} label="Help & support" />
              </Section>
            </div>

            <div className="settings-drawer-footer text-center">
              <p className="font-telugu text-scale-xs text-muted-light" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                వైఖానస నిధి v3.0 / © 2024
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function Section({ title, children }) {
  return (
    <div className="settings-section">
      <div className="settings-section-title">{title}</div>
      {children}
    </div>
  );
}

function ToggleRow({ icon: Icon, label, value, onChange }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-[var(--drawer-bg)]">
      <Icon size={18} className="text-muted" />
      <span className="flex-1 text-scale-sm text-body">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0"
        style={{ background: value ? 'linear-gradient(135deg, #C88F2D, #E4B24B)' : 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-all duration-200 ${value ? 'left-5' : 'left-0.5'}`}
          style={{ background: value ? 'var(--bg-page)' : 'var(--text-muted)' }}
        />
      </button>
    </div>
  );
}

function LinkRow({ icon: Icon, label }) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 px-5 py-3 w-full transition-colors bg-[var(--drawer-bg)] hover:bg-[var(--hover-bg)]"
    >
      <Icon size={18} className="text-muted" />
      <span className="flex-1 text-scale-sm text-left text-body">{label}</span>
      <ChevronRight size={16} className="text-muted-light" />
    </button>
  );
}
