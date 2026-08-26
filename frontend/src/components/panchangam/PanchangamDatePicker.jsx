import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toIstDateKey } from '../../lib/panchangamSource';

const WEEKDAYS = ['ఆ', 'సో', 'మం', 'బు', 'గు', 'శు', 'శ'];

const MONTHS_TE = [
  'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్',
  'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్',
];

function parseIstDateKey(dateKey) {
  return new Date(`${dateKey}T12:00:00+05:30`);
}

function buildMonthCells(year, month) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toIstDateKey(new Date(year, month, day)));
  }
  return cells;
}

/** Popup month calendar — opens when user taps date or calendar icon */
export default function PanchangamDatePicker({ open, onClose, selectedDate, onSelectDate }) {
  const selectedKey = toIstDateKey(selectedDate);
  const todayKey = toIstDateKey(new Date());
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  useEffect(() => {
    if (open) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [open, selectedDate]);

  const cells = useMemo(() => buildMonthCells(viewYear, viewMonth), [viewYear, viewMonth]);

  if (!open) return null;

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function pickDay(dateKey) {
    onSelectDate(parseIstDateKey(dateKey));
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
      style={{ background: 'var(--bg-overlay)' }}
      role="dialog"
      aria-modal="true"
      aria-label="తేదీ ఎంచుకోండి"
      onClick={onClose}
    >
      <div
        className="panchang-card w-full max-w-sm overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3 py-2.5 panchang-card-header">
          <span className="font-telugu font-bold text-sm">తేదీ ఎంచుకోండి</span>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:opacity-80" aria-label="మూసివేయి">
            <X size={18} color="#1a1208" />
          </button>
        </div>

        <div className="panchang-card-body px-2 pb-4 pt-2">
          <div className="flex items-center justify-between mb-2 px-1">
            <button
              type="button"
              onClick={prevMonth}
              className="panchang-nav-btn w-8 h-8 rounded-full flex items-center justify-center"
              aria-label="మునుపటి నెల"
            >
              <ChevronLeft size={18} color="#1a1208" />
            </button>
            <p className="font-telugu font-bold text-sm panchang-title">
              {MONTHS_TE[viewMonth]} {viewYear}
            </p>
            <button
              type="button"
              onClick={nextMonth}
              className="panchang-nav-btn w-8 h-8 rounded-full flex items-center justify-center"
              aria-label="తదుపరి నెల"
            >
              <ChevronRight size={18} color="#1a1208" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="text-center font-telugu text-[10px] font-bold panchang-label py-1">
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((dateKey, i) => {
              if (!dateKey) return <div key={`e-${i}`} className="aspect-square" />;
              const dayNum = Number(dateKey.slice(8, 10));
              const isSelected = dateKey === selectedKey;
              const isToday = dateKey === todayKey;
              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => pickDay(dateKey)}
                  className={[
                    'aspect-square rounded-md font-telugu text-xs font-semibold flex items-center justify-center',
                    isSelected ? 'panchang-nav-btn text-[#1a1208] ring-2 ring-[#C88F2D]' : 'hover:bg-[#C88F2D22] panchang-title',
                    isToday && !isSelected ? 'ring-1 ring-[#C88F2D88]' : '',
                  ].join(' ')}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
