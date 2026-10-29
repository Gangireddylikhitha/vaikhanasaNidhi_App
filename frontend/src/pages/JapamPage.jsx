import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';

const TARGET = 108;
const STORAGE_KEY = 'vaikhanasa-japam';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, malas: 0 };
    const parsed = JSON.parse(raw);
    return {
      count: Number.isFinite(parsed.count) ? parsed.count : 0,
      malas: Number.isFinite(parsed.malas) ? parsed.malas : 0,
    };
  } catch {
    return { count: 0, malas: 0 };
  }
}

export default function JapamPage() {
  const [{ count, malas }, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, malas }));
  }, [count, malas]);

  const increment = useCallback(() => {
    setState((s) => {
      const next = s.count + 1;
      if (next >= TARGET) return { count: 0, malas: s.malas + 1 };
      return { ...s, count: next };
    });
  }, []);

  function reset() {
    setState({ count: 0, malas: 0 });
  }

  const percent = Math.round((count / TARGET) * 100);

  return (
    <div className="min-h-screen w-full page-bg px-4 pb-24 pt-6 flex flex-col items-center">
      <h1 className="font-bold text-xl gold-glow text-center mb-8" style={{ fontFamily: 'Tiro Telugu, serif' }}>
        ఓం నమో వేంకటేశాయ
      </h1>

      <button
        type="button"
        onClick={increment}
        className="w-56 h-56 rounded-full flex flex-col items-center justify-center mb-6 active:scale-95 transition-transform"
        style={{
          border: '6px solid var(--gold-strong)',
          background: 'var(--bg-card)',
          boxShadow: '0 0 24px rgba(200,143,45,0.15)',
        }}
        aria-label="Tap to count"
      >
        <span className="text-6xl font-bold gold-glow tabular-nums">{count}</span>
        <span className="text-sm text-muted mt-2">లక్ష్యం: {TARGET} ({percent}%)</span>
      </button>

      <div className="w-full max-w-xs mb-8">
        <div className="h-2 rounded-full overflow-hidden bg-elevated" style={{ border: '1px solid var(--border-subtle)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(percent, 100)}%`, background: 'var(--gold-strong)' }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>0</span>
          <span>{TARGET}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={increment}
        className="w-full max-w-xs py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform btn-gold"
        style={{ fontFamily: 'Tiro Telugu, serif' }}
      >
        <Sparkles size={18} /> నామ జపం చేయండి (+1)
      </button>

      <div className="flex items-center justify-between w-full max-w-xs mt-8 text-sm">
        <button type="button" onClick={reset} className="flex items-center gap-1.5 text-muted hover:text-white transition-colors">
          <RotateCcw size={15} /> రీసెట్
        </button>
        <span className="text-muted">
          పూర్తయిన మాలలు: <span className="font-semibold gold-glow">{malas}</span>
        </span>
      </div>
    </div>
  );
}
