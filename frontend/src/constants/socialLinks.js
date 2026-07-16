import { Capacitor } from '@capacitor/core';

/** Mobile-friendly WhatsApp chat — opens the app when installed (not WhatsApp Web). */
export const WHATSAPP_PHONE = '917981091684';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}`;
export const WHATSAPP_APP_URL = `whatsapp://send?phone=${WHATSAPP_PHONE}`;
export const WHATSAPP_DISPLAY = '79810 91684';
export const INSTAGRAM_URL =
  'https://www.instagram.com/ssri_vaikhanasam_app?utm_source=qr&igsh=MTQwYXF3Y2FhNDFwZw==';

export const SOCIAL_LINKS = [
  {
    id: 'whatsapp',
    href: WHATSAPP_URL,
    label: 'WhatsApp Chat',
    display: `Chat: ${WHATSAPP_DISPLAY}`,
  },
  {
    id: 'instagram',
    href: INSTAGRAM_URL,
    label: 'Instagram',
    display: '@ssri_vaikhanasam_app',
  },
];

/** Open WhatsApp chat in the native app when possible (never WhatsApp Web desktop page). */
export function openWhatsAppChat(event) {
  event?.preventDefault?.();
  if (Capacitor.isNativePlatform()) {
    // App deep link first — opens WhatsApp directly on the device.
    window.location.href = WHATSAPP_APP_URL;
    return;
  }
  window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer');
}
