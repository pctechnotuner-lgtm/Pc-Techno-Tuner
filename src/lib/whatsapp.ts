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

/** Builds a WhatsApp Business Android intent with a safe HTTPS fallback. */
export const getWhatsAppBusinessUrl = (value: string, message = '', includeFooter = true): string => {
  const digits = String(value || '').replace(/\D/g, '');
  const phone = digits.length === 10 ? '91' + digits : digits;
  if (!phone) return '';
  const text = message ? message + (includeFooter ? getCompanyWhatsAppFooter() : '') : '';
  const query = text ? '?text=' + encodeURIComponent(text) : '';
  const webUrl = 'https://wa.me/' + phone + query;

  if (/Android/i.test(navigator.userAgent)) {
    const intentQuery = '?phone=' + phone + (text ? '&text=' + encodeURIComponent(text) : '');
    return 'intent://send/' + intentQuery +
      '#Intent;scheme=whatsapp;package=com.whatsapp.w4b;S.browser_fallback_url=' +
      encodeURIComponent(webUrl) + ';end';
  }

  return webUrl;
};

export const openWhatsAppBusiness = (value: string, message = '', includeFooter = true): void => {
  const url = getWhatsAppBusinessUrl(value, message, includeFooter);
  if (url) window.location.href = url;
};
