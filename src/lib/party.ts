import { Customer } from '../types';

export const normalizePartyPhone = (value?: string) => { const digits=(value||'').replace(/\D/g,''); return digits.length===12 && digits.startsWith('91') ? digits.slice(2) : digits; };

export const sameParty = (
  a: { name?: string; mobile?: string },
  b: { name?: string; mobile?: string }
) => {
  const phoneA = normalizePartyPhone(a.mobile);
  const phoneB = normalizePartyPhone(b.mobile);
  if (phoneA && phoneB) return phoneA === phoneB;
  const nameA = (a.name || '').trim().toLocaleLowerCase();
  const nameB = (b.name || '').trim().toLocaleLowerCase();
  return !!nameA && nameA === nameB && (!phoneA || !phoneB);
};

export const mergeParty = (current: Customer | undefined, incoming: Customer): Customer => ({
  ...(current || incoming),
  ...incoming,
  id: current?.id || incoming.id,
  name: incoming.name.trim() || current?.name || '',
  mobile: normalizePartyPhone(incoming.mobile) ? incoming.mobile.trim() : current?.mobile || '',
  businessName: incoming.businessName?.trim() || current?.businessName,
  email: incoming.email?.trim() || current?.email,
  address: incoming.address?.trim() || current?.address || '',
  gstin: incoming.gstin?.trim() || current?.gstin,
  notes: incoming.notes?.trim() || current?.notes,
  createdAt: current?.createdAt || incoming.createdAt,
});
