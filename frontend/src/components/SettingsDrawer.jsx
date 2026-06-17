import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Bell, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { getSettings, saveSettings } from '../store/useAppStore';

const GOLD = '#E4B24B';

export default function SettingsDrawer({ open, onClose }) {
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    if (open) setSettings(getSettings());
  }, [open]);

  function update(key, val) {
    const next = { ...settings, [key]: val };
    setSettings(next);
    saveSettings(next);
    if (key === 'fontSize') {
      const map = { small: '14px', medium: '16px', large: '19px' };
      document.documentElement.style.fontSize = map[val] || '16px';
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 max-w-full z-50 shadow-2xl flex flex-col"
            style={{ background: '#111111', borderLeft: '1px solid #C88F2D22' }}>

            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #C88F2D22' }}>
              <h2 className="font-semibold text-lg gold-glow" style={{ fontFamily: 'Playfair Display, serif' }}>Settings</h2>
              <button onClick={onClose} style={{ color: '#C88F2D99' }} className="hover:text-white"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <Section title="రూపం">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Type size={18} style={{ color: '#C88F2D66' }} />
                  <span className="flex-1 font-telugu text-sm" style={{ fontFamily: 'Tiro Telugu, serif', color: '#C88F2Dcc' }}>అక్షర పరిమాణం</span>
                  <div className="flex gap-1">
                    {['small', 'medium', 'large'].map(s => (
                      <button key={s}
                        onClick={() => update('fontSize', s)}
                        className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: settings.fontSize === s ? 'linear-gradient(135deg, #C88F2D, #E4B24B)' : '#1a1a1a',
                          color: settings.fontSize === s ? '#0a0a0a' : '#C88F2D99',
                          border: settings.fontSize === s ? 'none' : '1px solid #C88F2D33',
                        }}>
                        A
                        <span className="sr-only">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Section>

              <Section title="నోటిఫికేషన్లు">
                <ToggleRow icon={Bell} label="రోజువారీ శ్లోకం" value={settings.notifyDailySloka}
                  onChange={v => update('notifyDailySloka', v)} />
                <ToggleRow icon={Bell} label="పంచాంగం" value={settings.notifyPanchangam}
                  onChange={v => update('notifyPanchangam', v)} />
              </Section>

              <Section title="గురించి">
                <LinkRow icon={Shield} label="గోప్యతా విధానం" />
                <LinkRow icon={HelpCircle} label="సహాయం & మద్దతు" />
              </Section>
            </div>

            <div className="px-5 py-4 text-center" style={{ borderTop: '1px solid #C88F2D22' }}>
              <p className="font-telugu text-xs" style={{ fontFamily: 'Tiro Telugu, serif', color: '#C88F2D44' }}>
                వైఖానస నిధి v3.0 / © 2024
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ borderBottom: '1px solid #C88F2D15' }}>
      <div className="px-5 pt-4 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#C88F2D55' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ icon: Icon, label, value, onChange }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon size={18} style={{ color: '#C88F2D66' }} />
      <span className="flex-1 font-telugu text-sm" style={{ fontFamily: 'Tiro Telugu, serif', color: '#C88F2Dcc' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full transition-all duration-200 relative"
        style={{ background: value ? 'linear-gradient(135deg, #C88F2D, #E4B24B)' : '#222', border: '1px solid #C88F2D33' }}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-all duration-200 ${value ? 'left-5' : 'left-0.5'}`}
          style={{ background: value ? '#0a0a0a' : '#555' }}
        />
      </button>
    </div>
  );
}

function LinkRow({ icon: Icon, label }) {
  return (
    <button className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/5 transition-colors">
      <Icon size={18} style={{ color: '#C88F2D66' }} />
      <span className="flex-1 font-telugu text-sm text-left" style={{ fontFamily: 'Tiro Telugu, serif', color: '#C88F2Dcc' }}>{label}</span>
      <ChevronRight size={16} style={{ color: '#C88F2D44' }} />
    </button>
  );
}
