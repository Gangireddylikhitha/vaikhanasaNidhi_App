import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Bell, BookOpen, ChevronRight, ArrowRight } from 'lucide-react';
import { markOnboardingDone } from '../store/useAppStore';
import ThemeToggle from '../components/ThemeToggle';
import logo from '../assets/images/logo.png';

const SLIDES = [
  {
    step: '1 / 4',
    icon: null,
    useAppLogo: true,
    title: 'శ్రీ వైఖానస నిధి కీ స్వాగతం',
    desc: 'మంత్రాలు, స్తోత్రాలు మరియు వైఖానస సంప్రదాయ విషయాలు ఒకే చోట.',
    btnLabel: 'కొనసాగండి',
    btnStyle: 'outline',
  },
  {
    step: '2 / 4',
    icon: Shield,
    title: 'లాగిన్ తప్పనిసరి',
    desc: 'యాప్ కంటెంట్‌ను సురక్షితంగా వీక్షించడానికి దయచేసి లాగిన్ అవ్వండి.',
    btnLabel: 'లాగిన్ అవ్వండి / కొనసాగండి',
    btnStyle: 'filled',
  },
  {
    step: '3 / 4',
    icon: Bell,
    title: 'నోటిఫికేషన్లను అనుమతించండి',
    desc: 'కొత్త కంటెంట్ అప్డేట్లు, పండుగ సమాచారం మరియు ముఖ్యమైన నోటిఫికేషన్లను పొందడానికి అనుమతించండి.',
    btnLabel: 'నోటిఫికేషన్లు అనుమతించండి',
    btnStyle: 'filled',
  },
  {
    step: '4 / 4',
    icon: BookOpen,
    title: 'కంటెంట్ అన్వేషించండి',
    desc: 'భక్తి కంటెంట్‌ను సులభంగా శోధించండి, చదవండి మరియు సేవ్ చేయండి.',
    btnLabel: 'యాప్ ఉపయోగించడం ప్రారంభించండి',
    btnStyle: 'gold',
  },
];

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;
  const IconComp = slide.icon;

  function next() {
    if (isLast) { markOnboardingDone(); onDone(); }
    else setStep(s => s + 1);
  }

  function skip() { markOnboardingDone(); onDone(); }

  return (
    <div
      className="onboarding-shell fixed inset-0 z-40 page-bg"
      style={{ backgroundImage: 'var(--hero-glow)' }}
    >
      <div className="absolute top-4 right-4 z-20 safe-top-offset">
        <ThemeToggle />
      </div>

      <div className="onboarding-inner w-full h-dvh max-w-md mx-auto flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
          <span className="font-telugu text-sm gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            పరిచయం • {slide.step}
          </span>
          {step < SLIDES.length - 1 && (
            <button onClick={skip} className="text-sm text-muted hover:text-white transition-colors">
              దాటవేయి
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="onboarding-card flex-1 corner-card flex flex-col min-h-0 sm:rounded-3xl sm:mx-4 sm:mb-4"
          >
            <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-8 gap-6 text-center">
              {slide.useAppLogo ? (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
                  style={{ border: '1px solid var(--border-medium)', boxShadow: '0 0 30px rgba(200,143,45,0.35)' }}
                >
                  <img src={logo} alt="Vaikhanasa Nidhi" className="w-16 h-16 object-contain" />
                </div>
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center bg-elevated"
                  style={{ border: '1px solid var(--border-medium)' }}
                >
                  {IconComp && <IconComp size={36} color="#E4B24B" strokeWidth={1.5} />}
                </div>
              )}

              <h2 className="font-telugu text-2xl sm:text-3xl font-bold leading-snug gold-glow-strong max-w-sm" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                {slide.title}
              </h2>

              <p className="font-telugu leading-relaxed text-base text-muted max-w-sm" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                {slide.desc}
              </p>

              {(slide.btnStyle === 'filled' || slide.btnStyle === 'gold') && (
                <button
                  onClick={next}
                  className="w-full max-w-sm py-3.5 rounded-2xl font-telugu text-base font-semibold flex items-center justify-center gap-2 btn-gold active:scale-95"
                  style={{ fontFamily: 'Tiro Telugu, serif' }}
                >
                  {slide.btnLabel}
                  {slide.btnStyle === 'gold' && <ArrowRight size={18} />}
                </button>
              )}
            </div>

            <div className="px-5 sm:px-6 pb-6 pt-2 safe-bottom-offset">
              <div className="flex items-center justify-center gap-2 mb-5">
                {SLIDES.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width: i === step ? 28 : 10,
                      background: i === step ? '#C88F2D' : 'var(--border-medium)',
                      boxShadow: i === step ? '0 0 8px rgba(200,143,45,0.5)' : 'none',
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-2.5 rounded-full"
                  />
                ))}
              </div>

              {slide.btnStyle === 'outline' && (
                <button
                  onClick={next}
                  className="w-full py-4 rounded-2xl font-telugu text-base font-semibold flex items-center justify-center gap-2 btn-ghost active:scale-95"
                  style={{ fontFamily: 'Tiro Telugu, serif' }}
                >
                  {slide.btnLabel} <ChevronRight size={18} />
                </button>
              )}
              {(slide.btnStyle === 'filled' || slide.btnStyle === 'gold') && (
                <button
                  onClick={next}
                  className="w-full py-4 rounded-2xl font-telugu text-base flex items-center justify-center gap-2 btn-ghost active:scale-95 text-muted"
                  style={{ fontFamily: 'Tiro Telugu, serif' }}
                >
                  కొనసాగండి <ChevronRight size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
