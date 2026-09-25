import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Share2, CalendarDays } from 'lucide-react';
import { toIstDateKey } from '../../lib/panchangamSource';

export function NithraPage({ children, onShare }) {
  return (
    <div className="panchang-page w-full pb-28">
      <div className="w-full max-w-lg mx-auto px-3 pt-3">
        {onShare && (
          <div className="flex justify-end mb-1">
            <button type="button" onClick={onShare} className="p-2 text-muted" aria-label="Share">
              <Share2 size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function NavBtn({ children, onClick, ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="panchang-nav-btn w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
      {...props}
    >
      {children}
    </button>
  );
}

/** Date row with ← date 📅 → — tap date or icon to open calendar */
export function NithraDateSelector({ dateLabel, date, onPrev, onNext, onOpenCalendar, onDateChange }) {
  const dateInputRef = useRef(null);
  const dateKey = toIstDateKey(date);

  function openPicker() {
    if (onOpenCalendar) {
      onOpenCalendar();
      return;
    }
    dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click();
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 my-2">
      <NavBtn onClick={onPrev} aria-label="మునుపటి రోజు">
        <ChevronLeft size={22} color="#1a1208" />
      </NavBtn>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={openPicker}
          className="panchang-date font-bold text-2xl sm:text-3xl leading-none px-1"
          aria-label="తేదీ ఎంచుకోండి"
        >
          {dateLabel}
        </button>
        <button
          type="button"
          onClick={openPicker}
          className="panchang-nav-btn w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          aria-label="క్యాలెండర్ తెరవండి"
        >
          <CalendarDays size={20} color="#1a1208" />
        </button>
      </div>

      <NavBtn onClick={onNext} aria-label="తదుపరి రోజు">
        <ChevronRight size={22} color="#1a1208" />
      </NavBtn>

      {onDateChange && (
        <input
          ref={dateInputRef}
          type="date"
          value={dateKey}
          onChange={(e) => onDateChange(new Date(`${e.target.value}T12:00:00+05:30`))}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        />
      )}
    </div>
  );
}

export function NithraHeaderCard({ n }) {
  return (
    <div className="panchang-card w-full mb-3" style={{ borderWidth: 2 }}>
      <div className="px-4 pt-4 pb-3 text-center">
        <p className="panchang-title font-telugu font-bold text-base">{n.headerMonthVaaram}</p>
        <p className="panchang-title font-telugu font-bold text-sm mt-0.5">{n.vasaraSanskrit}</p>
        <p className="panchang-title font-telugu font-bold text-sm mt-3">{n.samvatsaraTitle}</p>
        <p className="panchang-title font-telugu text-sm mt-1">{n.maasam}</p>
        <p className="panchang-title font-telugu text-sm">{n.ruthuvu}</p>
        <p className="panchang-title font-telugu text-sm">{n.ayanam}</p>
      </div>
    </div>
  );
}

export function NithraBanner({ text }) {
  if (!text) return null;
  return (
    <div className="panchang-card w-full py-2.5 px-3 mb-3 text-center font-telugu font-semibold text-sm panchang-title">
      {text}
    </div>
  );
}

export function NithraSunMoonGrid({ n }) {
  const rows = [
    [{ label: 'సూర్యోదయం', value: n.sunrise }, { label: 'సూర్యాస్తమయం', value: n.sunset }],
    [{ label: 'చంద్రోదయం', value: n.moonrise }, { label: 'చంద్రాస్తమయం', value: n.moonset }],
  ];
  return (
    <div className="panchang-card w-full mb-3">
      {rows.map((row, ri) => (
        <div key={ri} className="grid grid-cols-2">
          {row.map((cell) => (
            <div key={cell.label} className="border-r last:border-r-0 panchang-divider">
              <div className="panchang-card-header py-2 text-center font-telugu font-bold text-sm">
                {cell.label}
              </div>
              <div className="panchang-card-body py-3 text-center font-bold text-sm">{cell.value || '—'}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function NithraMuhurtaStrip({ n }) {
  const varjyamText = Array.isArray(n.varjyam)
    ? n.varjyam.filter((v) => v && v !== '—').join(' • ') || '—'
    : n.varjyam || '—';

  const cells = [
    { label: 'రాహుకాలం', value: n.rahukalam },
    { label: 'యమగండం', value: n.yamagandam },
    { label: 'వర్జ్యము', value: varjyamText },
  ];

  return (
    <div className="panchang-card w-full mb-3">
      {cells.map((cell, i) => (
        <div
          key={cell.label}
          className={i < cells.length - 1 ? 'border-b panchang-divider' : ''}
        >
          <div className="panchang-card-header py-2 text-center font-telugu font-bold text-sm">
            {cell.label}
          </div>
          <div className="panchang-card-body py-3 px-2 text-center font-telugu text-xs leading-relaxed">
            {cell.value || '—'}
          </div>
        </div>
      ))}
    </div>
  );
}

export function NithraPanchangGrid({ n }) {
  const cells = [
    { title: 'తిథి', text: n.tithiLine },
    { title: 'నక్షత్రం', text: n.nakshatraLine },
    { title: 'యోగం', text: n.yogaLine },
    { title: 'కరణం', text: n.karanaLine },
  ];
  return (
    <div className="panchang-card w-full mb-3 grid grid-cols-2">
      {cells.map((cell, i) => (
        <div
          key={cell.title}
          className={`p-3 panchang-divider ${i < 2 ? 'border-b' : ''} ${i % 2 === 0 ? 'border-r' : ''}`}
        >
          <p className="panchang-label font-telugu font-bold text-sm mb-1.5">{cell.title}</p>
          <p className="panchang-title font-telugu text-xs leading-relaxed">{cell.text || '—'}</p>
        </div>
      ))}
    </div>
  );
}

export function NithraSection({ title, children }) {
  return (
    <div className="panchang-card w-full mb-3">
      <div className="panchang-card-header py-2.5 px-3 text-center font-telugu font-bold text-sm">
        {title}
      </div>
      <div className="panchang-card-body px-3 py-3 font-telugu text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function NithraDualSection({ leftTitle, leftValue, rightTitle, rightValue }) {
  return (
    <div className="panchang-card w-full mb-3 grid grid-cols-2">
      {[
        { title: leftTitle, value: leftValue },
        { title: rightTitle, value: rightValue },
      ].map((side, i) => (
        <div key={side.title} className={i === 0 ? 'border-r panchang-divider' : ''}>
          <div className="panchang-card-header py-2 text-center font-telugu font-bold text-xs sm:text-sm px-1">
            {side.title}
          </div>
          <div className="panchang-card-body py-3 px-2 text-center font-telugu text-xs leading-relaxed min-h-[52px] flex items-center justify-center">
            {side.value || '—'}
          </div>
        </div>
      ))}
    </div>
  );
}

export function NithraPhase4Grid({ phase4 }) {
  if (!phase4) return null;
  const items = [
    ['మాసం', phase4.maasam],
    ['పక్షం', phase4.paksham],
    ['ఋతువు', phase4.ruthuvu],
    ['అయనం', phase4.ayanam],
    ['ఏకాదశి', phase4.ekadashi],
    ['అమావాస్య', phase4.amavasya],
    ['పౌర్ణమి', phase4.pournami],
    ['సంక్రాంతి', phase4.sankranti],
  ].filter(([, v]) => v && v !== '—');

  if (!items.length) return null;

  return (
    <div className="panchang-card w-full mb-3 grid grid-cols-2">
      {items.map(([label, value], i) => (
        <div
          key={label}
          className={`p-3 panchang-divider ${i < items.length - 2 ? 'border-b' : ''} ${i % 2 === 0 ? 'border-r' : ''}`}
        >
          <p className="panchang-label font-telugu text-[11px] mb-1">{label}</p>
          <p className="panchang-title font-telugu text-xs font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function NithraTodayChip({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto block mb-3 px-4 py-1 rounded-full font-telugu text-xs font-semibold shadow btn-gold"
      style={{ fontFamily: 'Tiro Telugu, serif', color: '#1a1208' }}
    >
      నేడు
    </button>
  );
}
