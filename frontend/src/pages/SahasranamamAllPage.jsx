import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { VISHNU_SAHASRANAMA_SLOKAS } from '../data/sahasraNamalu';
import { getDailySahasranamaIndex } from '../lib/dailySloka';
import { sahasranamTodayPath } from '../utils/sahasranamLink';

/** Full static 108 ślokas page. */
export default function SahasranamamAllPage() {
  const todayIndex = getDailySahasranamaIndex();

  return (
    <div className="min-h-screen page-bg pb-24">
      <div className="page-header px-4 sm:px-6 pt-5 pb-5 sticky top-0 z-10 backdrop-blur-md"
        style={{ background: 'color-mix(in srgb, var(--bg-page) 92%, transparent)' }}
      >
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted mb-3 hover:opacity-80">
          <ChevronLeft size={14} /> Back
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-primary-gold" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                {VISHNU_SAHASRANAMA_SLOKAS.length} శ్లోకాలు
              </p>
            </div>
            <h1
              className="font-telugu font-bold text-xl sm:text-2xl gold-glow"
              style={{ fontFamily: 'Tiro Telugu, serif' }}
            >
              శ్రీ విష్ణు సహస్రనామం
            </h1>
            <p className="text-sm text-muted mt-1">పూర్తి స్తోత్రం — అన్ని శ్లోకాలు</p>
          </div>
          <Link
            to={sahasranamTodayPath()}
            className="flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl"
            style={{ background: '#C88F2D18', color: '#E4B24B', border: '1px solid #C88F2D33' }}
          >
            నేటి శ్లోకం
          </Link>
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-2xl mx-auto space-y-3 pt-2">
        {VISHNU_SAHASRANAMA_SLOKAS.map((sloka, i) => {
          const num = i + 1;
          const isToday = num === todayIndex;
          return (
            <motion.article
              key={num}
              id={`sloka-${num}`}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.25 }}
              className="corner-card rounded-2xl p-4 sm:p-5"
              style={{
                border: isToday ? '1px solid rgba(200,143,45,0.55)' : '1px solid var(--border-subtle)',
                boxShadow: isToday ? '0 0 0 1px rgba(200,143,45,0.2)' : undefined,
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-xs font-semibold gold-glow">శ్లోకం {num}</p>
                {isToday && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md"
                    style={{ background: '#C88F2D22', color: '#E4B24B' }}
                  >
                    నేటిది
                  </span>
                )}
              </div>
              <p
                className="font-telugu leading-loose font-semibold gold-glow-strong whitespace-pre-line text-sm sm:text-base mb-3"
                style={{ fontFamily: 'Tiro Telugu, serif' }}
              >
                {sloka.telugu}
              </p>
              <p
                className="font-telugu leading-relaxed reading-meaning text-xs sm:text-sm"
                style={{ fontFamily: 'Tiro Telugu, serif' }}
              >
                {sloka.meaning}
              </p>
              <p className="text-[10px] text-muted mt-3">— {sloka.source}</p>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
