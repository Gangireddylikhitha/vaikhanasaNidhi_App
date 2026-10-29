import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartHandshake, QrCode, ChevronRight, Sparkles } from 'lucide-react';
import donationQr from '../assets/images/donationQr.png';

const AMOUNTS = [51, 101, 501, 1001];
const GOLD = '#E4B24B';

export default function SupportCard({ className = '', compact = false }) {
  const navigate = useNavigate();

  function openSupport(amount) {
    if (amount) {
      navigate(`/support?amount=${amount}`);
    } else {
      navigate('/support');
    }
  }

  if (compact) {
    return (
      <div
        onClick={() => openSupport()}
        className={`gold-card rounded-2xl p-4 cursor-pointer hover:brightness-110 transition-all flex items-center gap-3.5 ${className}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && openSupport()}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#C88F2D22', border: '1px solid #C88F2D44' }}
        >
          <HeartHandshake size={20} color={GOLD} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-telugu font-bold text-sm gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              సేవా సహకారం
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Support
            </span>
          </div>
          <p className="text-xs text-muted line-clamp-1" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            ఈ App ఉచితంగా కొనసాగాలంటే మీ సహాయం అవసరం
          </p>
        </div>
        <ChevronRight size={16} className="text-muted flex-shrink-0" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`gold-card rounded-2xl p-5 sm:p-6 relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(200, 143, 45, 0.12), rgba(20, 15, 8, 0.85))',
        border: '1px solid rgba(228, 178, 75, 0.35)',
        boxShadow: '0 8px 32px rgba(200, 143, 45, 0.12)',
      }}
    >
      {/* Decorative background glow */}
      <div
        className="absolute -top-16 -right-16 w-44 h-44 rounded-full pointer-events-none blur-3xl opacity-20"
        style={{ background: 'radial-gradient(circle, #E4B24B 0%, transparent 70%)' }}
      />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#C88F2D25', border: '1px solid #C88F2D44' }}
          >
            <HeartHandshake size={20} color={GOLD} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-telugu font-bold text-base sm:text-lg gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                సేవా సహకారం
              </h3>
              <Sparkles size={14} className="text-primary-gold" />
            </div>
            <p className="text-[11px] uppercase tracking-wider text-muted">Support &amp; Contribution</p>
          </div>
        </div>

        {/* Small QR preview */}
        <button
          type="button"
          onClick={() => openSupport()}
          className="flex-shrink-0 w-12 h-12 p-1 rounded-xl bg-black/40 hover:scale-105 transition-transform"
          style={{ border: '1px solid rgba(228, 178, 75, 0.3)' }}
          title="QR Code Scan చేయండి"
        >
          <img src={donationQr} alt="QR Code" className="w-full h-full object-contain rounded" />
        </button>
      </div>

      {/* Main message */}
      <div className="space-y-1.5 mb-4">
        <p className="font-telugu font-semibold text-sm sm:text-base leading-snug text-body" style={{ fontFamily: 'Tiro Telugu, serif' }}>
          ఈ App మీ కోసం ఉచితంగా కొనసాగాలంటే మీ సహాయం అవసరం.
        </p>
        <p className="font-telugu text-xs sm:text-sm leading-relaxed text-secondary" style={{ fontFamily: 'Tiro Telugu, serif' }}>
          App Development, Server, Content &amp; Maintenance కోసం మీ వంతు సహాయం చేయండి.
        </p>
      </div>

      {/* Quick Amount Selection Chips */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {AMOUNTS.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => openSupport(amt)}
            className="py-2 px-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 text-center"
            style={{
              background: 'rgba(200, 143, 45, 0.15)',
              border: '1px solid rgba(228, 178, 75, 0.35)',
              color: GOLD,
              fontFamily: 'Tiro Telugu, serif',
            }}
          >
            ₹{amt}
          </button>
        ))}
      </div>

      {/* Action CTA */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => openSupport()}
          className="flex-1 py-2.5 px-4 rounded-xl font-telugu font-bold text-sm flex items-center justify-center gap-2 btn-gold shadow-lg"
          style={{ fontFamily: 'Tiro Telugu, serif' }}
        >
          <QrCode size={16} />
          <span>QR Code &amp; UPI ద్వారా సహకారం అందించండి</span>
        </button>
      </div>
    </motion.div>
  );
}
