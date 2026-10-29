import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Copy, Check, HeartHandshake, QrCode, Sparkles, Smartphone, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import donationQr from '../assets/images/donationQr.png';
import { WHATSAPP_URL, openWhatsAppChat } from '../constants/socialLinks';

const AMOUNTS = [51, 101, 501, 1001];
const GOLD = '#E4B24B';
const UPI_ID = '7981091684@ybl';
const PHONE_NUMBER = '7981091684';
const BENEFICIARY_NAME = 'ROMPICHARLA SRI HARSHA VIKHANASA BHATTAR';
const BENEFICIARY_TELUGU = 'శ్రీ హర్ష రొంపిచర్ల';

export default function SupportPage() {
  const [searchParams] = useSearchParams();
  const initialAmount = Number(searchParams.get('amount')) || 101;
  const [selectedAmount, setSelectedAmount] = useState(
    AMOUNTS.includes(initialAmount) ? initialAmount : 101
  );
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  function handleSelectAmount(amt) {
    setSelectedAmount(amt);
  }

  async function copyToClipboard(text, isUpi = true) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      if (isUpi) {
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2500);
        toast.success('UPI ID కాపీ చేయబడింది! (' + text + ')');
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2500);
        toast.success('ఫోన్ నంబర్ కాపీ చేయబడింది! (' + text + ')');
      }
    } catch {
      toast.error('కాపీ చేయడం సాధ్యం కాలేదు.');
    }
  }

  function payViaUpi() {
    const amountStr = selectedAmount > 0 ? `&am=${selectedAmount}` : '';
    const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(BENEFICIARY_NAME)}${amountStr}&cu=INR&tn=${encodeURIComponent('Vaikhanasa Nidhi Devotional Support')}`;
    window.location.href = upiUrl;
  }

  return (
    <div className="min-h-screen page-bg pb-28">
      {/* Header */}
      <div className="page-header px-4 sm:px-6 pt-5 pb-6">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted mb-3 hover:opacity-80">
          <ChevronLeft size={14} /> Back to Home
        </Link>
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{
              background: 'linear-gradient(135deg, rgba(200, 143, 45, 0.25), rgba(228, 178, 75, 0.15))',
              border: '1px solid rgba(228, 178, 75, 0.4)',
              boxShadow: '0 0 20px rgba(200, 143, 45, 0.25)',
            }}
          >
            <HeartHandshake size={28} color={GOLD} />
          </div>
          <h1 className="font-telugu font-bold text-2xl sm:text-3xl gold-glow-strong" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            సేవా సహకారం
          </h1>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-muted mt-1">Support &amp; Contribution</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-xl mx-auto space-y-6">
        {/* Main Appeal Card */}
       {/* Main Appeal Card */}
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  className="rounded-2xl p-5 sm:p-6 text-center relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-[rgba(200,143,45,0.14)] dark:to-[rgba(15,12,6,0.9)] border border-[rgba(228,178,75,0.4)] shadow-md dark:shadow-[0_8_32px_rgba(200,143,45,0.15)]"
>
  <div className="space-y-2 mb-2">
    <h2
      className="font-telugu font-bold text-base sm:text-lg text-amber-700 dark:text-primary-gold leading-snug"
      style={{ fontFamily: 'Tiro Telugu, serif' }}
    >
      ఈ App మీ కోసం ఉచితంగా కొనసాగాలంటే మీ సహాయం అవసరం.
    </h2>
    <p
      className="font-telugu text-sm sm:text-base leading-relaxed text-gray-700 dark:text-secondary"
      style={{ fontFamily: 'Tiro Telugu, serif' }}
    >
      App Development, Server, Content &amp; Maintenance కోసం మీ వంతు సహాయం చేయండి.
    </p>
  </div>
</motion.div>
        {/* Amount Selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="corner-card rounded-2xl p-5"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <p className="font-telugu font-semibold text-xs sm:text-sm text-muted mb-3 flex items-center justify-between" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            <span>మొత్తాన్ని ఎంచుకోండి (Select Amount):</span>
            {selectedAmount > 0 && (
              <span className="gold-glow font-bold text-base font-sans text-primary-gold">
                ₹{selectedAmount}
              </span>
            )}
          </p>

          <div className="grid grid-cols-4 gap-2">
            {AMOUNTS.map((amt) => {
              const active = selectedAmount === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectAmount(amt)}
                  className={`py-3 px-2 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 ${
                    active
                      ? 'btn-gold shadow-lg scale-105'
                      : 'hover:bg-white/5 text-secondary border'
                  }`}
                  style={{
                    borderColor: active ? 'transparent' : 'rgba(200, 143, 45, 0.3)',
                    background: active ? undefined : 'rgba(200, 143, 45, 0.08)',
                    fontFamily: 'Tiro Telugu, serif',
                  }}
                >
                  ₹{amt}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* QR Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="corner-card rounded-3xl p-6 text-center relative overflow-hidden"
          style={{
            border: '2px solid rgba(228, 178, 75, 0.45)',
            background: 'linear-gradient(180deg, rgba(20, 16, 8, 0.95), rgba(10, 8, 4, 0.98))',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(200, 143, 45, 0.2)',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <QrCode size={18} className="text-primary-gold" />
            <span className="font-telugu font-bold text-sm gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              PhonePe / Google Pay / Paytm / Any UPI
            </span>
          </div>

          {/* Glowing QR Image Container */}
          <div className="relative inline-block mx-auto mb-5 p-3 rounded-2xl bg-white shadow-2xl">
            <img
              src={donationQr}
              alt="Donation QR Code"
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
            />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Pay via UPI App (on Android / iOS) */}
            <button
              type="button"
              onClick={payViaUpi}
              className="w-full py-3.5 px-4 rounded-xl font-telugu font-bold text-sm sm:text-base flex items-center justify-center gap-2 btn-gold shadow-lg"
              style={{ fontFamily: 'Tiro Telugu, serif' }}
            >
              <Smartphone size={18} />
              <span>
                {selectedAmount > 0 ? `₹${selectedAmount} UPI యాప్ ద్వారా చెల్లించండి` : 'UPI యాప్ ద్వారా చెల్లించండి (Pay with UPI)'}
              </span>
            </button>

            {/* Quick Copy Rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => copyToClipboard(UPI_ID, true)}
                className="py-2.5 px-3 rounded-xl bg-elevated hover:bg-white/5 transition-colors border border-border flex items-center justify-between text-xs"
              >
                <div className="text-left min-w-0">
                  <span className="block text-[10px] text-muted">UPI ID:</span>
                  <span className="font-mono font-semibold text-body truncate block">{UPI_ID}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white/5 ml-2 text-primary-gold flex-shrink-0">
                  {copiedUpi ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(PHONE_NUMBER, false)}
                className="py-2.5 px-3 rounded-xl bg-elevated hover:bg-white/5 transition-colors border border-border flex items-center justify-between text-xs"
              >
                <div className="text-left min-w-0">
                  <span className="block text-[10px] text-muted">Phone / GPay:</span>
                  <span className="font-mono font-semibold text-body truncate block">{PHONE_NUMBER}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white/5 ml-2 text-primary-gold flex-shrink-0">
                  {copiedPhone ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* WhatsApp & Contact Help */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="corner-card rounded-2xl p-5 text-center"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center justify-center gap-1.5 text-primary-gold mb-2">
            <Sparkles size={16} />
            <p className="font-telugu font-bold text-sm gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              శ్రీమన్నారాయణ కటాక్ష సిద్ధిరస్తు
            </p>
          </div>
          <p className="font-telugu text-xs text-muted leading-relaxed mb-4" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            మరిన్ని వివరాలు లేదా సమాచారం కొరకు వాట్సాప్ ద్వారా మమ్మల్ని సంప్రదించవచ్చు.
          </p>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={openWhatsAppChat}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-telugu text-xs sm:text-sm font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 transition-colors"
            style={{ fontFamily: 'Tiro Telugu, serif' }}
          >
            <MessageCircle size={16} />
            <span>వాట్సాప్‌లో సందేశం పంపండి</span>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
