import { useState } from 'react';
import { User, Landmark, FileText, MapPin, Phone, Church, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { KALPASUTRAM_OPTIONS } from '../../constants/verificationConstants';
import { useSubmitVerification } from '../../hooks/useVerification';

function FieldLabel({ icon: Icon, te, en, required }) {
  return (
    <label className="verification-label flex items-start gap-2">
      {Icon && <Icon size={15} className="flex-shrink-0 mt-0.5 opacity-70" />}
      <span>
        <span className="font-telugu">{te}</span>
        <span className="opacity-70"> / {en}</span>
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
    </label>
  );
}

export default function VerificationForm({ onSuccess, compact = false }) {
  const [fullName, setFullName] = useState('');
  const [gothram, setGothram] = useState('');
  const [kalpasutram, setKalpasutram] = useState(KALPASUTRAM_OPTIONS[0].value);
  const [vedaShakha, setVedaShakha] = useState('');
  const [nativePlace, setNativePlace] = useState('');
  const [phone, setPhone] = useState('');
  const [templeReference, setTempleReference] = useState('');

  const submitMutation = useSubmitVerification({
    onSuccess: (data) => {
      toast.success('ధృవీకరణ అభ్యర్థన సమర్పించబడింది');
      onSuccess?.(data);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Submit failed'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    submitMutation.mutate({
      full_name: fullName,
      gothram,
      kalpasutram,
      veda_shakha: vedaShakha,
      native_place: nativePlace,
      whatsapp: phone,
      temple_reference: templeReference,
    });
  }

  return (
    <form onSubmit={handleSubmit} className={`verification-form ${compact ? '' : 'verification-form-page'}`}>
      {!compact && (
        <header className="verification-form-header mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={22} className="text-[#C45C26]" />
            <div>
              <h1 className="font-telugu font-bold text-xl text-[#C45C26]" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                వైఖానస సేవకుల ధృవీకరణ
              </h1>
              <p className="text-xs font-semibold tracking-wide text-[#5c5348] uppercase">
                Vaikhanasa Vedic Verification
              </p>
            </div>
          </div>
        </header>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel icon={User} te="సేవకుని పూర్తి పేరు" en="FULL NAME" required />
          <input className="verification-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <FieldLabel icon={Landmark} te="గోత్రము" en="GOTHRAM" required />
          <input className="verification-input" value={gothram} onChange={(e) => setGothram(e.target.value)} placeholder="ఉదా. కశ్యప, అత్రి" required />
        </div>
        <div>
          <FieldLabel icon={FileText} te="సూత్రము" en="KALPASUTRAM" required />
          <select className="verification-input" value={kalpasutram} onChange={(e) => setKalpasutram(e.target.value)} required>
            {KALPASUTRAM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.labelTe} / {o.labelEn}</option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel icon={FileText} te="వేద శాఖ" en="VEDA SHAKHA" />
          <input className="verification-input" value={vedaShakha} onChange={(e) => setVedaShakha(e.target.value)} placeholder="Yajurveda (Krishna Yajurveda)" />
        </div>
        <div>
          <FieldLabel icon={MapPin} te="స్వస్థలం" en="NATIVE PLACE" required />
          <input className="verification-input" value={nativePlace} onChange={(e) => setNativePlace(e.target.value)} placeholder="ఉదా. తిరుపతి, భద్రాచలం" required />
        </div>
        <div>
          <FieldLabel icon={Phone} te="మొబైల్ నంబర్" en="PHONE NUMBER" required />
          <input
            className="verification-input"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="9848022338"
            maxLength={10}
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <FieldLabel icon={Church} te="పనిచేస్తున్న దేవాలయం లేక అర్చక రెఫరెన్స్" en="TEMPLE/ARCHAKA REFERENCE" />
        <textarea
          className="verification-input min-h-[88px] resize-y"
          value={templeReference}
          onChange={(e) => setTempleReference(e.target.value)}
        />
      </div>

      <button type="submit" disabled={submitMutation.isPending} className="verification-submit-btn mt-6 w-full">
        {submitMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        ధృవీకరణకై సమర్పించండి / SUBMIT REQUEST
      </button>
    </form>
  );
}
