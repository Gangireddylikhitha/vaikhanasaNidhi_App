import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PartyPopper } from 'lucide-react';
import { usePanchangam } from '../hooks/usePanchangam';
import { toIstDateKey } from '../lib/panchangamSource';
import { isRegisteredUser } from '../store/authStore';
import { useUserData, useMarkFestivalPopupSeen, getLocalFestivalPopupSeenDate } from '../hooks/useUserData';

// Same "big enough to interrupt the user" filter as the backend push notification.
const NOTIFY_CATEGORIES = new Set(['major', 'solar', 'sankranti']);

export default function FestivalPopup() {
  const navigate = useNavigate();
  const registered = isRegisteredUser();
  const dateKey = toIstDateKey(new Date());
  const { data } = usePanchangam(new Date());
  const { data: userData } = useUserData();
  const markSeen = useMarkFestivalPopupSeen();
  const [dismissed, setDismissed] = useState(false);

  const festivals = (data?.festivals || []).filter((f) => NOTIFY_CATEGORIES.has(f.category));
  const seenDate = registered ? userData?.last_festival_popup_seen : getLocalFestivalPopupSeenDate();
  const open = festivals.length > 0 && !dismissed && seenDate !== dateKey;

  function close() {
    setDismissed(true);
    markSeen.mutate(dateKey);
  }

  function viewPanchangam() {
    close();
    navigate('/panchangam');
  }

  if (!festivals.length) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="corner-card rounded-2xl w-full max-w-sm shadow-2xl bg-card relative overflow-hidden"
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 text-muted"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="p-6 pt-8 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center bg-elevated mb-3"
                style={{ border: '1px solid var(--border-subtle)' }}>
                <PartyPopper size={26} className="text-primary-gold" />
              </div>

              <p className="text-xs font-semibold text-muted mb-1">ఈరోజు</p>
              <h2 className="text-lg font-bold gold-glow mb-3" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                {festivals.map((f) => f.nameTe || f.name).join(' • ')}
              </h2>

              {festivals[0]?.description && (
                <p className="text-sm text-muted mb-5" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                  {festivals[0].description}
                </p>
              )}

              <div className="modal-actions modal-actions--inline">
                <button type="button" onClick={close} className="modal-btn btn-ghost">
                  <span className="modal-btn-label">సరే (OK)</span>
                </button>
                <button type="button" onClick={viewPanchangam} className="modal-btn modal-btn-primary btn-gold">
                  <span className="modal-btn-label">పంచాంగం చూడండి</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
