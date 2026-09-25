import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck, BellRing, Lock } from 'lucide-react';

const GOLD = '#C88F2D';

const sections = [
  {
    title: '1. Overview',
    body: 'Vaikhanasa Nidhi is a devotional mobile application that provides access to Vaikhanasa scriptures, stotrams, panchangam information, gallery content, and related spiritual resources. This Privacy Policy explains what information we collect, how we use it, and the choices you have regarding your data.',
  },
  {
    title: '2. Information We Collect',
    body: 'When you use the app, we may collect basic account information such as your name, username, and profile details when you register or update your profile. We also store app preferences such as theme, font size, reading progress, bookmarks, and notification settings. If you enable push notifications, we may process your device token to deliver notifications such as daily sloka reminders or panchangam updates.',
  },
  {
    title: '3. How We Use Your Information',
    body: 'We use the information to provide core app features, personalize your experience, remember your reading progress and bookmarks, deliver notifications you have opted into, support account access, and improve the reliability and quality of the service. We do not use your personal information for advertising or sell it to third parties.',
  },
  {
    title: '4. Data Sharing',
    body: 'We may share limited information with trusted service providers that help us operate the app, such as hosting, cloud storage, authentication, and push notification services. These providers are only permitted to use the data as needed to provide those services and are required to protect it appropriately. We may also disclose information if required by law or to protect the safety and rights of users.',
  },
  {
    title: '5. Notifications and Device Permissions',
    body: 'The app may request notification permission on Android devices to send optional updates such as daily sloka reminders, panchangam alerts, and new content notifications. You can disable these notifications at any time from the app settings or device settings.',
  },
  {
    title: '6. Security',
    body: 'We take reasonable steps to protect your information from unauthorized access, loss, or misuse. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.',
  },
  {
    title: '7. Your Choices',
    body: 'You may update or remove your profile information, manage notification settings, and delete your account where supported by the app. Please note that some data may be retained for operational, security, or legal reasons even after account deletion.',
  },
  {
    title: '8. Children’s Privacy',
    body: 'This app is intended for general users and does not target children specifically. If a parent or guardian becomes aware that a child has provided personal information without permission, please contact us so we can take appropriate action.',
  },
  {
    title: '9. Contact Us',
    body: 'If you have questions about this Privacy Policy or how your data is handled, please contact us at sriharsharompicharla2000@gmail.com.',
  },
];

function PolicySection({ title, body }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 sm:p-5"
      style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}
    >
      <h2 className="font-semibold text-base mb-2" style={{ color: GOLD }}>
        {title}
      </h2>
      <p className="text-sm leading-7 text-secondary">
        {body}
      </p>
    </motion.section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen page-bg pb-24">
      <div className="page-header px-4 sm:px-6 pt-5 pb-5">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted mb-3 hover:opacity-80">
          <ChevronLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#C88F2D18', border: '1px solid #C88F2D33' }}>
            <ShieldCheck size={18} color={GOLD} />
          </div>
          <div>
            <h1 className="font-telugu font-bold text-xl sm:text-2xl gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              గోప్యతా విధానం
            </h1>
            <p className="text-sm text-muted">Privacy Policy</p>
          </div>
        </div>
        <p className="text-sm leading-7 text-secondary max-w-2xl">
          This Privacy Policy describes how Vaikhanasa Nidhi collects, uses, and protects information when you use the app.
        </p>
      </div>

      <div className="px-4 sm:px-6 max-w-3xl mx-auto space-y-4">
        {sections.map((section) => (
          <PolicySection key={section.title} title={section.title} body={section.body} />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 sm:p-5"
          style={{ border: '1px solid var(--border-subtle)', background: 'linear-gradient(135deg, rgba(200,143,45,0.12), rgba(228,178,75,0.08))' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <BellRing size={16} color={GOLD} />
            <h2 className="font-semibold text-base" style={{ color: GOLD }}>Notification Notice</h2>
          </div>
          <p className="text-sm leading-7 text-secondary">
            Push notifications are optional. You may opt in or out at any time from the app settings or your device notification settings.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 sm:p-5"
          style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Lock size={16} color={GOLD} />
            <h2 className="font-semibold text-base" style={{ color: GOLD }}>Security Commitment</h2>
          </div>
          <p className="text-sm leading-7 text-secondary">
            We are committed to protecting user privacy and will update this policy when needed to reflect new features or legal requirements.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
