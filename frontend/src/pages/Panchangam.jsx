import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { usePanchangam } from '../hooks/usePanchangam';
import { toIstDateKey } from '../lib/panchangamSource';
import PanchangamDatePicker from '../components/panchangam/PanchangamDatePicker';
import {
  NithraPage,
  NithraHeaderCard,
  NithraDateSelector,
  NithraBanner,
  NithraSunMoonGrid,
  NithraPanchangGrid,
  NithraSection,
  NithraDualSection,
  NithraPhase4Grid,
  NithraTodayChip,
} from '../components/panchangam/NithraLayout';

function buildShareText(p, n) {
  if (!p || !n) return '';
  return [
    `📅 ${n.dateDdMmYyyy} — ${n.headerMonthVaaram}`,
    n.samvatsaraTitle,
    `తిథి: ${n.tithiLine}`,
    `నక్షత్రం: ${n.nakshatraLine}`,
    `సూర్యోదయం: ${n.sunrise} | సూర్యాస్తమయం: ${n.sunset}`,
    `రాహుకాలం: ${n.rahukalam}`,
    p.phases?.phase4?.ekadashi ? `ఏకాదశి: ${p.phases.phase4.ekadashi}` : '',
  ].filter(Boolean).join('\n');
}

function formatDisplayDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getFullYear()}`;
}

export default function Panchangam() {
  const [date, setDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, isFetching, refetch } = usePanchangam(date);
  const p = data;
  const n = p?.nithra;
  const ph = p?.phases;
  const dateKey = toIstDateKey(date);
  const isToday = dateKey === toIstDateKey(new Date());
  const dateLabel = n?.dateDdMmYyyy || formatDisplayDate(date);

  function prevDay() {
    setDate((d) => { const next = new Date(d); next.setDate(next.getDate() - 1); return next; });
  }
  function nextDay() {
    setDate((d) => { const next = new Date(d); next.setDate(next.getDate() + 1); return next; });
  }
  function goToday() {
    setDate(new Date());
  }
  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['panchangam'] });
    refetch();
  }
  async function share() {
    const text = buildShareText(p, n);
    if (!text) return;
    if (navigator.share) {
      try { await navigator.share({ title: 'పంచాంగం', text }); } catch { /* */ }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  }

  const p3 = ph?.phase3 || n;

  return (
    <NithraPage onShare={n ? share : undefined}>
      <PanchangamDatePicker
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        selectedDate={date}
        onSelectDate={setDate}
      />

      {!isToday && <NithraTodayChip onClick={goToday} />}

      {/* Date + calendar icon — always visible */}
      <div className="panchang-card w-full mb-3 px-2 py-3" style={{ borderWidth: 2 }}>
        <NithraDateSelector
          dateLabel={dateLabel}
          date={date}
          onPrev={prevDay}
          onNext={nextDay}
          onOpenCalendar={() => setCalendarOpen(true)}
          onDateChange={setDate}
        />
      </div>

      {isLoading && !p && (
        <p className="font-telugu text-center py-8 text-body">పంచాంగం లోడ్ అవుతోంది…</p>
      )}

      {isError && !p && (
        <div className="text-center py-8 px-4">
          <p className="font-telugu text-red-400 mb-2">పంచాంగం లోడ్ కాలేదు</p>
          <p className="text-xs text-muted mb-3">{error?.message || 'సర్వర్ అందుబాటులో లేదు'}</p>
          <button type="button" onClick={refresh} className="px-4 py-2 rounded-md font-telugu text-sm btn-gold">
            మళ్లీ ప్రయత్నించు
          </button>
        </div>
      )}

      {p && !n && (
        <div className="text-center py-8 px-4">
          <p className="font-telugu text-body mb-3">పంచాంగం డేటా పూర్తిగా లేదు — నవీకరించండి</p>
          <button type="button" onClick={refresh} className="px-4 py-2 rounded-md font-telugu text-sm btn-gold">
            నవీకరించు
          </button>
        </div>
      )}

      {n && (
        <motion.div
          key={dateKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <NithraHeaderCard n={n} />
          <NithraBanner text={n.festivalBanner} />

          <NithraSunMoonGrid n={n} />
          <NithraPanchangGrid n={n} />
          <NithraPhase4Grid phase4={ph?.phase4} />

          {p3.shubhaSamayamulu && p3.shubhaSamayamulu !== '—' && (
            <NithraSection title="శుభ సమయములు">{p3.shubhaSamayamulu}</NithraSection>
          )}

          {n.shraddhaTithi && n.shraddhaTithi !== '—' && (
            <NithraSection title="శ్రాద్ధం తిథి (మధ్యాహ్నం ఉన్న తిథి)">{n.shraddhaTithi}</NithraSection>
          )}

          <NithraDualSection
            leftTitle="రాహుకాలం"
            leftValue={p3.rahukalam || n.rahukalam}
            rightTitle="యమగండం"
            rightValue={p3.yamagandam || n.yamagandam}
          />

          {(p3.durmuhurtham?.length > 0 || n.durmuhurtham?.length > 0) && (
            <NithraSection title="దుర్ముహూర్తం">
              {(p3.durmuhurtham || n.durmuhurtham).join(' • ')}
            </NithraSection>
          )}

          <NithraDualSection
            leftTitle="వర్జ్యము"
            leftValue={(p3.varjyam || n.varjyam)?.[0] || '—'}
            rightTitle="అమృత ఘడియలు"
            rightValue={(p3.amritaKalam || n.amritaGadiyalu)?.[0] || '—'}
          />

          <NithraDualSection
            leftTitle="గుళిక కాలం"
            leftValue={p3.gulikaKalam || n.gulikakalam}
            rightTitle="అభిజిత్ ముహూర్తం"
            rightValue={p3.abhijitMuhurtham || n.abhijitMuhurtham}
          />

          {ph?.phase4?.festivals?.length > 0 && (
            <NithraSection title="పండుగలు / వ్రతాలు">
              {ph.phase4.festivals.map((f) => f.name).join(' • ')}
            </NithraSection>
          )}

          {isFetching && (
            <p className="text-center text-xs text-muted py-2">నవీకరిస్తోంది…</p>
          )}

          <button
            type="button"
            onClick={refresh}
            className="w-full py-2 mb-4 rounded-md font-telugu text-sm btn-gold"
          >
            నవీకరించు
          </button>
        </motion.div>
      )}
    </NithraPage>
  );
}
