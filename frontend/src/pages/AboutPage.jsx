import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import vaikhanasaGuru from '../assets/images/vaikhanasaGuru.png';

const ABOUT_POINTS = [
  'వైఖానస నిధి అనేది వైఖానస సంప్రదాయ పవిత్ర జ్ఞానాన్ని డిజిటల్ రూపంలో సంరక్షించి, అందరికీ సులభంగా అందుబాటులో ఉంచే భక్తి డిజిటల్ వేదిక.',
  'వైఖానస మంత్రాలు, స్తోత్రాలు, ఆగమ విషయాలు మరియు భక్తి గ్రంథాలను అర్చకులు, విద్యార్థులు మరియు భక్తులకు స్పష్టమైన, చదవగలిగే రూపంలో అందించడమే ఈ వేదిక ప్రధాన లక్ష్యం.',
  'ఈ యాప్ కేవలం PDFలను చూడడానికి మాత్రమే కాదు — యాప్ లోనే నిర్వహితమైన వచనాలను అందిస్తుంది, చదవడానికి మరింత సౌకర్యంగా.',
  'శ్రీమన్నారాయణ భక్తితో, శ్రీ వైఖాన మహర్షి పట్ల గౌరవంతో భవిష్యత్ తరాలకు వైఖానస సంప్రదాయాలను అందజేయడానికి ఈ యాప్ రూపొందించబడింది.',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen page-bg pb-24">
      <div className="page-header px-4 sm:px-6 pt-5 pb-6">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted mb-4 hover:opacity-80">
          <ChevronLeft size={14} /> Back
        </Link>
        <div className="max-w-2xl mx-auto text-center">
          <motion.img
            src={vaikhanasaGuru}
            alt="Vaikhanasa Guru"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto mb-4"
            style={{ filter: 'drop-shadow(0 0 20px rgba(200,143,45,0.35))' }}
          />
          <h1 className="font-telugu font-bold text-2xl sm:text-3xl gold-glow-strong" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            వైఖానస నిధి
          </h1>
         
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="corner-card rounded-2xl p-5 sm:p-7"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <ul className="space-y-5">
            {ABOUT_POINTS.map((text, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-3 text-sm sm:text-base leading-relaxed text-secondary"
                style={{ fontFamily: 'Tiro Telugu, serif' }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: '#C88F2D' }} />
                <span>{text}</span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-8 py-4 px-4 rounded-xl text-center gold-card">
            <p className="font-telugu font-bold text-lg gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              విఖనస మహాగురవే నమః
            </p>
          </div>

          <p className="mt-6 text-right text-sm text-muted" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            భక్తిపూర్వక ప్రణామాలతో
            <br />
            <span className="gold-glow">— వైఖానస నిధి బృందం</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
