import type { CompanyProfile } from '../types';

const getCompanyProfile = (): Partial<CompanyProfile> => {
  try {
    const raw = localStorage.getItem('pctechno_profile_v1');
    return raw ? JSON.parse(raw) as Partial<CompanyProfile> : {};
  } catch { return {}; }
};

export const getCompanyWhatsAppFooter = (): string => {
  const p = getCompanyProfile();
  const name = p.name || 'PC TECHNO TUNER';
  const lines = [
    '',
    '━━━━━━━━━━━━━━━━━━━━',
    '🏢 ' + name,
    p.tagline || 'IT Hardware, CCTV Surveillance, Laptop Repairs & AMC Solutions',
    '📞 Mobile / WhatsApp: ' + (p.mobile || '7383871195'),
    '✉️ Email: ' + (p.email || 'info@pctechnotuner.com'),
    '📍 Address: ' + [p.address || 'A-104, Vedant Skyline, Vastral, SP Ring Road', p.location || 'Ahmedabad, Gujarat, India', p.pincode || '382418'].filter(Boolean).join(', '),
    '🌐 Website: pctechnotuner.com',
    '━━━━━━━━━━━━━━━━━━━━',
    'Thank you for choosing ' + name + '!'
  ];
  return lines.join('\n');
};

/** Opens a blank chat or a prefilled message directly in WhatsApp Business on Android. */
export const getWhatsAppBusinessUrl = (value: string, message = '', includeFooter = true): string => {
  const digits = String(value || '').replace(/\\D/g, '');
  const phone = digits.length === 10 ? '91' + digits : digits;
  if (!phone) return '';
  const text = message ? message + (includeFooter ? getCompanyWhatsAppFooter() : '') : '';
  const isAndroid = /Android/i.test(navigator.userAgent);
  return isAndroid
    ? 'intent://send?phone=' + phone + (text ? '&text=' + encodeURIComponent(text) : '') + '#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end'
    : 'https://wa.me/' + phone + (text ? '?text=' + encodeURIComponent(text) : '');
};

export const openWhatsAppBusiness = (value: string, message = '', includeFooter = true): void => {
  const url = getWhatsAppBusinessUrl(value, message, includeFooter);
  if (url) window.location.href = url;
};
