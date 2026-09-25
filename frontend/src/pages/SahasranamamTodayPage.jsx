import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, Sparkles } from 'lucide-react';
import { useDailySloka } from '../hooks/useDailySloka';
import { sahasranamAllPath } from '../utils/sahasranamLink';
import heroImg from '../assets/images/heroImg.png';

/** Today's single śloka + meaning from static 108 list. */
export default function SahasranamamTodayPage() {
  const { data: sloka } = useDailySloka();

  return (
    <div className="min-h-screen page-bg pb-24">
      <div className="page-header px-4 sm:px-6 pt-5 pb-5">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted mb-3 hover:opacity-80">
          <ChevronLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-primary-gold" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            నేటి శ్లోకం · {sloka.index} / {sloka.total}
          </p>
        </div>
        <h1
          className="font-telugu font-bold text-xl sm:text-2xl gold-glow"
          style={{ fontFamily: 'Tiro Telugu, serif' }}
        >
          శ్రీ విష్ణు సహస్రనామం
        </h1>
        <p className="text-sm text-muted mt-1">{sloka.source}</p>
      </div>

      <div className="px-4 sm:px-6 max-w-2xl mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <img
            src={heroImg}
            alt=""
            className="object-contain"
            style={{ height: 160, maxWidth: 140, filter: 'drop-shadow(0 0 20px rgba(200,143,45,0.3))' }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="corner-card rounded-2xl p-5 bg-elevated"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-xs font-semibold mb-3 uppercase tracking-wider text-muted">శ్లోకం</p>
          <p
            className="font-telugu leading-loose font-semibold gold-glow-strong whitespace-pre-line text-base sm:text-lg"
            style={{ fontFamily: 'Tiro Telugu, serif' }}
          >
            {sloka.telugu}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="corner-card rounded-2xl p-5 bg-elevated"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-xs font-semibold mb-3 uppercase tracking-wider text-muted">అర్థం</p>
          <p
            className="font-telugu leading-relaxed reading-meaning text-sm sm:text-base"
            style={{ fontFamily: 'Tiro Telugu, serif' }}
          >
            {sloka.meaning}
          </p>
        </motion.div>

        <p className="text-xs text-center text-muted-light pb-2">— {sloka.source}</p>

        <Link
          to={sahasranamAllPath()}
          className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold"
        >
          <BookOpen size={16} />
          <span className="font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            పూర్తి సహస్రనామం (108)
          </span>
        </Link>
      </div>
    </div>
  );
}
