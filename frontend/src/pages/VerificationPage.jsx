import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Landmark, ScrollText, FileText, MapPin, Phone,
  Building2, Send, Loader2, Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMyVerification, useSubmitVerification } from '../hooks/useVerification';
import { KALPASUTRAM_OPTIONS } from '../constants/verificationConstants';
import { getApiError } from '../lib/apiError';
import { isGuest, isVerifiedUser, updateVerificationStatus } from '../store/authStore';
import { useLoginPrompt } from '../context/LoginPromptContext';
import ThemeToggle from '../components/ThemeToggle';

function BilingualLabel({ te, en, icon: Icon, required }) {
  return (
    <label className="verification-label">
      <span className="flex items-center gap-1.5">
        {Icon && <Icon size={13} className="text-muted flex-shrink-0" />}
        <span className="font-telugu text-body" style={{ fontFamily: 'Tiro Telugu, serif' }}>{te}</span>
        <span className="text-muted text-[10px] tracking-wide">/ {en}{required ? ' *' : ''}</span>
      </span>
    </label>
  );
}

function PendingState() {
  return (
    <div className="verification-card text-center py-12 px-6">
      <Clock size={48} className="mx-auto text-primary-gold mb-4 opacity-80" />
      <h2 className="font-telugu text-xl gold-glow mb-2" style={{ fontFamily: 'Tiro Telugu, serif' }}>
        మీ దరఖాస్తు పరిశీలనలో ఉంది
      </h2>
      <p className="text-sm text-muted max-w-sm mx-auto">
        Your verification request is under review. You will be redirected automatically once approved.
      </p>
    </div>
  );
}

function RedirectingState() {
  return (
    <div className="verification-page min-h-screen flex flex-col items-center justify-center gap-3 p-6">
      <Loader2 className="animate-spin text-primary-gold" size={36} />
      <p className="font-telugu text-sm gold-glow text-center" style={{ fontFamily: 'Tiro Telugu, serif' }}>
        ధృవీకరణ పూర్తయింది — యాప్‌కు తీసుకెళ్తున్నాం...
      </p>
      <p className="text-xs text-muted">Opening the app for you</p>
    </div>
  );
}

export default function VerificationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { requireLogin } = useLoginPrompt();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/categories';

  const { data, isLoading } = useMyVerification({
    refetchInterval: (query) => {
      const status = query.state.data?.verification_status;
      return status === 'pending' ? 5000 : false;
    },
  });

  const [form, setForm] = useState({
    full_name: '',
    gothram: '',
    kalpasutram: KALPASUTRAM_OPTIONS[0].value,
    veda_shakha: '',
    native_place: '',
    whatsapp: '',
    temple_reference: '',
  });

  const status = data?.verification_status || 'none';
  const application = data?.application;

  useEffect(() => {
    if (!data?.verification_status) return;
    updateVerificationStatus(data.verification_status);
    if (data.verification_status === 'approved') {
      queryClient.invalidateQueries();
      toast.success('ధృవీకరణ పూర్తయింది!');
      navigate(returnTo, { replace: true });
    }
  }, [data?.verification_status, queryClient, navigate, returnTo]);

  useEffect(() => {
    if (!application || status !== 'rejected') return;
    setForm({
      full_name: application.full_name || '',
      gothram: application.gothram || '',
      kalpasutram: application.kalpasutram || KALPASUTRAM_OPTIONS[0].value,
      veda_shakha: application.veda_shakha || '',
      native_place: application.native_place || '',
      whatsapp: application.whatsapp || '',
      temple_reference: application.temple_reference || '',
    });
  }, [application, status]);

  const submitMutation = useSubmitVerification({
    onSuccess: () => toast.success('Verification request submitted!'),
    onError: (err) => toast.error(getApiError(err, 'Failed to submit request.')),
  });

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhoneChange(value) {
    setField('whatsapp', value.replace(/\D/g, '').slice(0, 10));
  }

  function handleSubmit(e) {
    e.preventDefault();
    submitMutation.mutate(form);
  }

  if (isGuest()) {
    requireLogin('/verification');
    return null;
  }

  if (isLoading) {
    return (
      <div className="verification-page min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-gold" size={32} />
      </div>
    );
  }

  if (status === 'approved' || isVerifiedUser()) {
    return <RedirectingState />;
  }

  if (status === 'pending') {
    return (
      <div className="verification-page min-h-screen p-4 sm:p-6">
        <div className="max-w-lg mx-auto pt-8">
          <PendingState />
        </div>
      </div>
    );
  }

  return (
    <div className="verification-page min-h-screen pb-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
        {status === 'rejected' && (
          <div className="verification-card mb-4 text-center py-3 text-sm verification-rejected-banner">
            మీ గత దరఖాస్తు తిరస్కరించబడింది. దయచేసి సరిచేసి మళ్లీ సమర్పించండి.
          </div>
        )}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="verification-header-icon">
              <ScrollText size={20} className="text-primary-gold" />
            </div>
            <div>
              <h1 className="font-telugu text-xl sm:text-2xl gold-glow font-bold leading-tight"
                style={{ fontFamily: 'Tiro Telugu, serif' }}>
                వైఖానస సేవకుల ధృవీకరణ
              </h1>
              <p className="text-xs sm:text-sm text-muted tracking-widest mt-0.5">
                VAIKHANASA VEDIC VERIFICATION
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button type="button" onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-muted hover:bg-[var(--hover-bg)] transition-colors">
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>

        <p className="text-[10px] sm:text-xs text-muted leading-relaxed tracking-wide border-b border-gold pb-5 mb-6 font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>
          శ్రీ వైఖానస గుప్తోపదేశాలు, మంత్ర శాస్త్రాల పరిరక్షణ మరియు దుర్వినియోగ నివారణార్థం కేవలం అర్హులైన వైఖానస అర్చకులకు, సేవకులకు మాత్రమే ప్రత్యేక గ్రంథాల అనుమతి లభిస్తుంది.
        </p>
        <p className="text-[10px] sm:text-xs text-muted leading-relaxed tracking-wide border-b border-gold pb-5 mb-6 -mt-4">
          TO PRESERVE SACRED VAIKHANASA ESOTERIC TEXTS AND PREVENT MISUSE, CREDENTIALS VERIFICATION IS MANDATORY FOR RESTRICTED MATERIAL PATH ACCESS.
        </p>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="verification-card space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <BilingualLabel te="సేవకుని పూర్తి పేరు" en="FULL NAME" icon={User} required />
              <input className="verification-input" value={form.full_name}
                onChange={(e) => setField('full_name', e.target.value)}
                placeholder="Likhitha Gangireddy" required />
            </div>
            <div>
              <BilingualLabel te="గోత్రము" en="GOTHRAM" icon={Landmark} required />
              <input className="verification-input font-telugu" value={form.gothram}
                onChange={(e) => setField('gothram', e.target.value)}
                placeholder="ఉదా. కశ్యప, అత్రి, భృగు" required
                style={{ fontFamily: 'Tiro Telugu, serif' }} />
            </div>
            <div>
              <BilingualLabel te="కల్పసూత్రము" en="KALPASUTRAM" icon={ScrollText} required />
              <select className="verification-input verification-select" value={form.kalpasutram}
                onChange={(e) => setField('kalpasutram', e.target.value)} required>
                {KALPASUTRAM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <BilingualLabel te="వేద శాఖ" en="VEDA SHAKHA" icon={FileText} />
              <input className="verification-input" value={form.veda_shakha}
                onChange={(e) => setField('veda_shakha', e.target.value)}
                placeholder="Yajurveda (Krishna Yajurveda)" />
            </div>
            <div>
              <BilingualLabel te="స్వస్థలం" en="NATIVE PLACE" icon={MapPin} required />
              <input className="verification-input font-telugu" value={form.native_place}
                onChange={(e) => setField('native_place', e.target.value)}
                placeholder="ఉదా. తిరుపతి, భద్రాచలం" required
                style={{ fontFamily: 'Tiro Telugu, serif' }} />
            </div>
            <div>
              <BilingualLabel te="మొబైల్ నంబర్" en="PHONE NUMBER" icon={Phone} required />
              <input className="verification-input" type="tel" inputMode="numeric" pattern="[0-9]*"
                value={form.whatsapp}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="9848022338" maxLength={10} required />
            </div>
          </div>

          <div>
            <BilingualLabel
              te="పనిచేస్తున్న దేవాలయం లేక అర్చక రెఫరెన్స్"
              en="TEMPLE/ARCHAKA REFERENCE"
              icon={Building2}
            />
            <textarea className="verification-input verification-textarea font-telugu" rows={3}
              value={form.temple_reference}
              onChange={(e) => setField('temple_reference', e.target.value)}
              placeholder="దేవాలయం పేరు, అర్చకత్వం చేస్తున్న కాలం లేక గురువుల రెఫరెన్స్..."
              style={{ fontFamily: 'Tiro Telugu, serif' }} />
          </div>

          <button type="submit" disabled={submitMutation.isPending}
            className="verification-submit-btn w-full flex items-center justify-center gap-2">
            {submitMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span className="font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>ధృవీకరణకై సమర్పించండి</span>
            <span className="text-sm opacity-90">/ SUBMIT REQUEST</span>
          </button>
        </motion.form>
      </div>
    </div>
  );
}
