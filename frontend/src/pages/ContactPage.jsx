import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Phone, Mail } from 'lucide-react';

const GOLD = '#C88F2D';

const CONTACT = {
  name: 'శ్రీ హర్ష రొంపిచర్ల',
  phone: '7981091684',
  email: 'sriharsharompicharla2000@gmail.com',
};

const FEEDBACK_TEXT =
  'యాప్ లో ఏవైనా అక్షర దోషాలు లేదా తప్పులు ఉంటే దయచేసి మాకు తెలియజేయగలరు.';

function ContactRow({ icon: Icon, label, value, href }) {
  const content = (
    <div className="flex items-start gap-4 py-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: '#C88F2D18', border: '1px solid #C88F2D33' }}>
        <Icon size={18} color={GOLD} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted mb-0.5" style={{ fontFamily: 'Tiro Telugu, serif' }}>{label}</p>
        <p className="font-semibold text-sm gold-glow break-all" style={{ fontFamily: 'Tiro Telugu, serif' }}>
          {value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block hover:brightness-110 transition-all rounded-xl -mx-2 px-2">
        {content}
      </a>
    );
  }
  return content;
}

export default function ContactPage() {
  return (
    <div className="min-h-screen page-bg pb-24">
      <div className="page-header px-4 sm:px-6 pt-5 pb-5">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted mb-3 hover:opacity-80">
          <ChevronLeft size={14} /> Back
        </Link>
        <h1 className="font-telugu font-bold text-xl sm:text-2xl gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
          సంప్రదింపు
        </h1>
        <p className="text-sm text-muted mt-1">Contact Us</p>
      </div>

      <div className="px-4 sm:px-6 max-w-lg mx-auto space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="corner-card rounded-2xl px-5 divide-y"
          style={{ borderColor: 'var(--border-subtle)', divideColor: 'var(--border-subtle)' }}
        >
          <ContactRow icon={User} label="పేరు" value={CONTACT.name} />
          <ContactRow icon={Phone} label="ఫోన్" value={CONTACT.phone} href={`tel:${CONTACT.phone}`} />
          <ContactRow icon={Mail} label="జిమెయిల్" value={CONTACT.email} href={`mailto:${CONTACT.email}`} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-telugu font-bold text-base mb-3 text-muted" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            సలహాలు &amp; సూచనలు
          </h2>
          <div className="corner-card rounded-2xl p-5">
            <p className="text-sm leading-relaxed text-secondary" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              {FEEDBACK_TEXT}
            </p>
          
          </div>
        </motion.div>
      </div>
    </div>
  );
}
