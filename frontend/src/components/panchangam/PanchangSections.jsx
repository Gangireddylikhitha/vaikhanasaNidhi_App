import { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Compass,
  Sun,
  Clock,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { toIstDateKey, formatPanchangDateTe, formatSamvatsaramTitleTe } from '../../lib/panchangamSource';

/* Vaikhanasa Panchangam — warm gold theme */
export const PANCHANG_COLORS = {
  goldBg: '#F3E2B5',
  goldBgDeep: '#E8D4A0',
  creamCard: '#FFFAF2',
  maroon: '#701111',
  orange: '#E67E22',
  orangeDark: '#C45C26',
  gold: '#B8860B',
  goldLight: '#D4AF37',
  label: '#8B7355',
  border: '#D9C48E',
  green: '#1B6B3A',
  greenLight: '#E8F5EC',
  orangeLight: '#FDF0E4',
  /** @deprecated use goldBg */
  cream: '#F3E2B5',
};

export function PanchangamHeader() {
  return (
    <div className="w-full flex items-center gap-2 min-w-0">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: PANCHANG_COLORS.creamCard, border: `1px solid ${PANCHANG_COLORS.border}` }}
      >
        <Sparkles size={17} style={{ color: PANCHANG_COLORS.goldLight }} />
      </div>
      <div className="flex-1 min-w-0 text-center overflow-hidden">
        <h1
          className="font-telugu font-bold text-[13px] sm:text-[15px] leading-tight whitespace-nowrap"
          style={{ fontFamily: 'Tiro Telugu, serif', color: PANCHANG_COLORS.maroon }}
        >
          శ్రీ వైఖానస దినసరి పంచాంగం
        </h1>
        <p
          className="text-[9px] sm:text-[10px] mt-0.5 font-telugu font-medium whitespace-nowrap"
          style={{ fontFamily: 'Tiro Telugu, serif', color: PANCHANG_COLORS.gold }}
        >
          దైనిక తెలుగు పంచాంగం
        </p>
      </div>
      <div className="w-9 flex-shrink-0" aria-hidden />
    </div>
  );
}

export function PanchangamNavBar({ date, onDateChange, onPrev, onNext, onToday }) {
  const dateInputRef = useRef(null);
  const isToday = toIstDateKey(date) === toIstDateKey(new Date());
  const dateKey = toIstDateKey(date);

  return (
    <nav className="w-full max-w-lg mx-auto flex items-center justify-center gap-1.5 mt-3 px-1">
      <NavCircleButton onClick={onPrev} aria-label="మునుపటి రోజు" small>
        <ChevronLeft size={18} />
      </NavCircleButton>

      <button
        type="button"
        onClick={onToday}
        className="px-2.5 py-1 rounded-full font-telugu text-[11px] font-semibold leading-none transition-all"
        style={{
          fontFamily: 'Tiro Telugu, serif',
          background: isToday ? PANCHANG_COLORS.creamCard : 'transparent',
          color: PANCHANG_COLORS.maroon,
          border: `1px solid ${isToday ? PANCHANG_COLORS.goldLight : PANCHANG_COLORS.border}`,
          boxShadow: isToday ? '0 1px 4px rgba(184,134,11,0.2)' : 'none',
        }}
      >
        ✦ నేడు
      </button>

      <NavCircleButton onClick={onNext} aria-label="తదుపరి రోజు" small>
        <ChevronRight size={18} />
      </NavCircleButton>

      <NavCircleButton onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()} aria-label="తేదీ ఎంచుకోండి" small>
        <Calendar size={16} />
      </NavCircleButton>

      <input
        ref={dateInputRef}
        type="date"
        value={dateKey}
        onChange={(e) => onDateChange(new Date(`${e.target.value}T12:00:00+05:30`))}
        className="sr-only"
        aria-hidden
      />
    </nav>
  );
}

function NavCircleButton({ children, onClick, small, ...props }) {
  const size = small ? 'w-8 h-8' : 'w-10 h-10 sm:w-11 sm:h-11';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${size} rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:opacity-80`}
      style={{
        background: PANCHANG_COLORS.creamCard,
        border: `1px solid ${PANCHANG_COLORS.border}`,
        color: PANCHANG_COLORS.maroon,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function PanchangamDateBadge({ dateLabel }) {
  const formatted = formatPanchangDateTe(dateLabel);
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${PANCHANG_COLORS.border}`,
        color: PANCHANG_COLORS.maroon,
      }}
    >
      <Calendar size={15} style={{ color: PANCHANG_COLORS.orange }} />
      <span className="font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>
        {formatted}
      </span>
    </div>
  );
}

export function PanchangamSamvatsaraTitle({ samvatsaram }) {
  const text = formatSamvatsaramTitleTe(samvatsaram);
  return (
    <h2
      className="font-telugu font-bold text-xl sm:text-2xl text-center leading-snug px-2"
      style={{ fontFamily: 'Tiro Telugu, serif', color: PANCHANG_COLORS.maroon }}
    >
      {text}
    </h2>
  );
}

export function PanchangamMetaLines({ items }) {
  return (
    <div className="w-full flex flex-col items-center gap-2 text-sm">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex flex-wrap items-center justify-center gap-1.5 text-center">
          {Icon && <Icon size={14} style={{ color: PANCHANG_COLORS.orange }} className="flex-shrink-0" />}
          <span className="font-telugu text-[#6B5E52]" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            {label}:
          </span>
          <span
            className="font-telugu font-semibold"
            style={{ fontFamily: 'Tiro Telugu, serif', color: PANCHANG_COLORS.orangeDark }}
          >
            {value || '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Vertical Panchang detail card — width/height auto from content.
 */
export function PanchangamDetailCard({
  labelTe,
  labelEn,
  value,
  endTime,
  accent = 'orange',
  footerText,
}) {
  const accentMap = {
    orange: { main: PANCHANG_COLORS.orangeDark, pill: PANCHANG_COLORS.orangeLight, pillBorder: '#F0C9A8' },
    green: { main: PANCHANG_COLORS.green, pill: PANCHANG_COLORS.greenLight, pillBorder: '#B8DFC8' },
    teal: { main: '#0D6E6E', pill: '#E6F4F4', pillBorder: '#A8D8D8' },
    purple: { main: '#5B2C6F', pill: '#F3EBF6', pillBorder: '#D4B8E0' },
  };
  const theme = accentMap[accent] || accentMap.orange;
  const showFooter = (endTime && endTime !== '—') || footerText;

  return (
    <article
      className="w-full h-auto rounded-[24px] px-5 py-5 sm:px-6 sm:py-6"
      style={{
        background: PANCHANG_COLORS.creamCard,
        border: `1px solid ${PANCHANG_COLORS.border}`,
      }}
    >
      <p
        className="text-[11px] uppercase tracking-wider font-semibold mb-2"
        style={{ color: PANCHANG_COLORS.label }}
      >
        <span className="font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>{labelTe}</span>
        {labelEn && <span className="ml-1">({labelEn})</span>}
      </p>
      <p
        className="font-telugu font-bold text-xl sm:text-2xl leading-tight"
        style={{ fontFamily: 'Tiro Telugu, serif', color: theme.main }}
      >
        {value || '—'}
      </p>
      {showFooter && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {endTime && endTime !== '—' && (
            <span
              className="inline-block px-3 py-1 rounded-lg text-xs font-semibold font-telugu"
              style={{
                fontFamily: 'Tiro Telugu, serif',
                background: theme.pill,
                border: `1px solid ${theme.pillBorder}`,
                color: theme.main,
              }}
            >
              {endTime}
            </span>
          )}
          {footerText && (
            <span
              className="text-sm font-telugu"
              style={{ fontFamily: 'Tiro Telugu, serif', color: '#7A6E62' }}
            >
              {footerText}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

export function PanchangamDailyInfoCard({ items }) {
  return (
    <section
      className="w-full h-auto rounded-[24px] px-5 py-5 sm:px-6 sm:py-6"
      style={{
        background: PANCHANG_COLORS.creamCard,
        border: `1px solid ${PANCHANG_COLORS.border}`,
      }}
    >
      <h3
        className="font-telugu text-sm font-bold mb-4 text-center"
        style={{ fontFamily: 'Tiro Telugu, serif', color: PANCHANG_COLORS.maroon }}
      >
        దిన సూచనలు
      </h3>
      <div className="flex flex-col gap-3 w-full">
        {items.map(({ label, value }) => (
          <div
            key={label}
            className="w-full h-auto py-3 border-t first:border-t-0 first:pt-0"
            style={{ borderColor: PANCHANG_COLORS.border }}
          >
            <p
              className="font-telugu text-xs mb-1.5"
              style={{ fontFamily: 'Tiro Telugu, serif', color: PANCHANG_COLORS.label }}
            >
              {label}
            </p>
            <p
              className="font-telugu text-sm font-semibold leading-relaxed"
              style={{ fontFamily: 'Tiro Telugu, serif', color: PANCHANG_COLORS.maroon }}
            >
              {value || '—'}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PanchangamInlineCard({ titleTe, titleEn, children }) {
  return (
    <section
      className="w-full h-auto rounded-[24px] px-5 py-5 sm:px-6 sm:py-6"
      style={{
        background: PANCHANG_COLORS.creamCard,
        border: `1px solid ${PANCHANG_COLORS.border}`,
      }}
    >
      <h3
        className="text-[11px] uppercase tracking-wider font-semibold mb-4"
        style={{ color: PANCHANG_COLORS.label }}
      >
        <span className="font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>{titleTe}</span>
        {titleEn && <span className="ml-1">({titleEn})</span>}
      </h3>
      {children}
    </section>
  );
}

export function PanchangamRow({ labelTe, value }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5 border-t first:border-t-0"
      style={{ borderColor: PANCHANG_COLORS.border }}
    >
      <span
        className="font-telugu text-sm"
        style={{ fontFamily: 'Tiro Telugu, serif', color: '#6B5E52' }}
      >
        {labelTe}
      </span>
      <span
        className="font-telugu font-semibold text-sm sm:text-right sm:max-w-[60%]"
        style={{ fontFamily: 'Tiro Telugu, serif', color: PANCHANG_COLORS.maroon }}
      >
        {value || '—'}
      </span>
    </div>
  );
}

export function PanchangamSunGrid({ sunrise, sunset, moonrise, moonset }) {
  const items = [
    { icon: Sunrise, label: 'సూర్యోదయం', value: sunrise, color: PANCHANG_COLORS.orange },
    { icon: Sunset, label: 'సూర్యాస్తమయం', value: sunset, color: '#C0392B' },
    { icon: Sun, label: 'చంద్రోదయం', value: moonrise, color: '#5B6ABF' },
    { icon: Sun, label: 'చంద్రాస్తమయం', value: moonset, color: '#6B7280' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {items.map(({ icon: Icon, label, value, color }) => (
        <div
          key={label}
          className="rounded-2xl px-3 py-3 h-auto"
          style={{ background: '#FFFFFF', border: `1px solid ${PANCHANG_COLORS.border}` }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Icon size={14} style={{ color }} />
            <span
              className="font-telugu text-[11px]"
              style={{ fontFamily: 'Tiro Telugu, serif', color: PANCHANG_COLORS.label }}
            >
              {label}
            </span>
          </div>
          <p className="font-semibold text-sm" style={{ color: PANCHANG_COLORS.maroon }}>
            {value || '—'}
          </p>
        </div>
      ))}
    </div>
  );
}

export const PanchangMetaIcons = { Compass, Sun, Clock };
