/** Opens a blank chat directly in WhatsApp Business on Android. */
export const getWhatsAppBusinessUrl = (value: string): string => {
  const digits = String(value || '').replace(/\\D/g, '');
  const phone = digits.length === 10 ? '91' + digits : digits;
  if (!phone) return '';
  const isAndroid = /Android/i.test(navigator.userAgent);
  return isAndroid
    ? 'intent://send?phone=' + phone + '#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end'
    : 'https://wa.me/' + phone;
};

export const openWhatsAppBusiness = (value: string): void => {
  const url = getWhatsAppBusinessUrl(value);
  if (url) window.location.href = url;
};
