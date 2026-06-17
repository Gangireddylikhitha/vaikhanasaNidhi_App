import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, BookOpen, Sparkles, X } from "lucide-react";
import { DAILY_SLOKAS } from "../../data/scriptures";
import heroImg from "../../assets/images/heroImg.png";

const GOLD = "#E4B24B";
const GOLD_MID = "#C88F2D";

export default function HeroCard() {
  const sloka = DAILY_SLOKAS[0];
  const [open, setOpen] = useState(false);

  function handleShare() {
    if (navigator.share) navigator.share({ title: "Vaikhanasa Nidhi", text: sloka.telugu });
    else navigator.clipboard?.writeText(sloka.telugu);
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden mx-4 sm:mx-6 mt-4 sm:mt-8"
      >
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 min-h-[340px] md:min-h-[400px]">

          {/* Left — content */}
          <div className="flex-1 z-10 w-full md:w-1/2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} style={{ color: GOLD_MID }} />
              <span
                className="text-xs font-semibold tracking-[0.2em] uppercase"
                style={{ color: GOLD_MID, textShadow: '0 0 8px rgba(200,143,45,0.4)' }}
              >
                Divine Inspiration
              </span>
            </div>

            <h1
              className="font-telugu font-bold leading-relaxed mb-4 gold-glow-strong cursor-pointer"
              style={{ fontFamily: "Tiro Telugu, serif", fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}
              onClick={() => setOpen(true)}
            >
              {sloka.telugu}
            </h1>

            <p
              className="text-sm leading-relaxed mb-6 max-w-lg"
              style={{ color: '#C88F2D99', fontFamily: "Tiro Telugu, serif" }}
            >
              {sloka.meaning}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)', color: '#0a0a0a' }}
              >
                <BookOpen size={15} />
                Explore Scriptures
              </Link>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded text-sm font-semibold transition-all hover:bg-white/5 active:scale-95"
                style={{ border: '1px solid #C88F2D66', color: GOLD }}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right — deity image */}
          <div className="relative flex-shrink-0 w-full md:w-1/2 flex justify-center md:justify-end">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 60% 50%, rgba(200,143,45,0.12) 0%, transparent 65%)' }}
            />
            <motion.img
              src={heroImg}
              alt="deity"
              className="relative object-contain drop-shadow-2xl pointer-events-none select-none"
              style={{ height: 'clamp(240px, 45vw, 380px)', filter: 'drop-shadow(0 0 30px rgba(200,143,45,0.25))' }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </motion.section>

      {/* Full Sloka Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-4 bottom-4 top-16 z-50 rounded-2xl overflow-hidden shadow-2xl flex flex-col corner-card"
              style={{ background: '#141414', border: '1px solid #C88F2D22' }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #C88F2D22' }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} style={{ color: GOLD_MID }} />
                  <div>
                    <p className="font-bold text-sm gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
                      నేటి దివ్య శ్లోకం
                    </p>
                    <p className="text-xs" style={{ color: '#C88F2D66' }}>{sloka.source}</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5"
                  style={{ color: GOLD, border: '1px solid #C88F2D44' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col md:flex-row">
                  <div className="flex justify-center md:w-56 md:flex-shrink-0 md:self-end">
                    <img src={heroImg} alt="deity" className="object-contain object-bottom" style={{ height: 220, maxWidth: 180, filter: 'drop-shadow(0 0 20px rgba(200,143,45,0.3))' }} />
                  </div>
                  <div className="flex-1 px-5 py-5 md:py-6">
                    <div className="rounded-xl p-4 mb-4" style={{ background: '#1a1a1a', border: '1px solid #C88F2D22' }}>
                      <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#C88F2D66' }}>శ్లోకం</p>
                      <p className="font-telugu leading-loose font-semibold gold-glow" style={{ fontFamily: "Tiro Telugu, serif", fontSize: 16 }}>
                        {sloka.telugu}
                      </p>
                    </div>
                    <div className="rounded-xl p-4 mb-4" style={{ background: '#1a1a1a', border: '1px solid #C88F2D22' }}>
                      <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#C88F2D66' }}>అర్థం</p>
                      <p className="font-telugu leading-relaxed" style={{ fontFamily: "Tiro Telugu, serif", color: '#C88F2Dcc', fontSize: 14 }}>
                        {sloka.meaning}
                      </p>
                    </div>
                    <p className="text-xs text-center mb-5" style={{ color: '#C88F2D55' }}>— {sloka.source}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium hover:bg-white/5 active:scale-95 transition-all"
                        style={{ border: '1px solid #C88F2D44', color: GOLD }}
                      >
                        <Share2 size={15} /> Share
                      </button>
                      <Link
                        to="/search"
                        onClick={() => setOpen(false)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-all"
                        style={{ background: 'linear-gradient(135deg, #C88F2D 0%, #E4B24B 100%)', color: '#0a0a0a' }}
                      >
                        <BookOpen size={15} /> Read More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
