import React, { useMemo, useState } from 'react';
import { AntivirusLicense } from '../types';
import { ShieldCheck, Plus, Search, CalendarClock, MessageCircle, Trash2, Pencil, AlertTriangle } from 'lucide-react';

interface Props {
  licenses: AntivirusLicense[];
  onSave: (item: AntivirusLicense) => void;
  onDelete: (id: string) => void;
}

const daysUntil = (date: string) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const expiry = new Date(date + 'T00:00:00');
  return Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
};

export const AntivirusView: React.FC<Props> = ({ licenses, onSave, onDelete }) => {
  const blank = (): AntivirusLicense => ({ id: '', customerName: '', mobile: '', address: '', purchaseDate: new Date().toISOString().slice(0,10), licenseKey: '', antivirusCompany: '', expiryDate: '', createdAt: new Date().toISOString() });
  const [form, setForm] = useState<AntivirusLicense>(blank());
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const update = (key: keyof AntivirusLicense, value: string) => setForm(old => ({ ...old, [key]: value }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.mobile.trim() || !form.address.trim() || !form.purchaseDate || !form.licenseKey.trim() || !form.antivirusCompany.trim() || !form.expiryDate) { alert('Please fill all antivirus license details.'); return; }
    onSave({ ...form, id: form.id || 'PCT-AV-' + Date.now(), createdAt: form.createdAt || new Date().toISOString() });
    setForm(blank()); setEditing(false); setShowForm(false);
  };
  const filtered = useMemo(() => licenses.filter(x => [x.customerName,x.mobile,x.antivirusCompany,x.licenseKey].some(v => v.toLowerCase().includes(search.toLowerCase()))).sort((a,b) => a.expiryDate.localeCompare(b.expiryDate)), [licenses,search]);
  const reminderCount = licenses.filter(x => daysUntil(x.expiryDate) >= 0 && daysUntil(x.expiryDate) <= 5).length;
  const expiredCount = licenses.filter(x => daysUntil(x.expiryDate) < 0).length;
  const openEdit = (x: AntivirusLicense) => { setForm(x); setEditing(true); setShowForm(true); };
  const wa = (x: AntivirusLicense) => window.open('https://wa.me/91' + x.mobile.replace(/\D/g,'') + '?text=' + encodeURIComponent('Hello ' + x.customerName + ', your ' + x.antivirusCompany + ' antivirus license will expire on ' + x.expiryDate + '. Please contact PC TECHNO TUNER for renewal.'), '_blank');
  return <div className="max-w-6xl mx-auto space-y-5">
    <div className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-950/50 to-slate-950 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><div className="flex items-center gap-2 text-violet-300"><ShieldCheck/><span className="font-bold text-xs uppercase tracking-widest">License Management</span></div><h1 className="text-2xl font-black text-white mt-2">Antivirus Licenses</h1><p className="text-sm text-slate-400 mt-1">Customer licenses, expiry dates and renewal reminders</p></div>
      <button onClick={() => {setForm(blank());setEditing(false);setShowForm(true);}} className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-3 flex items-center justify-center gap-2"><Plus size={18}/> Add License</button>
    </div>
    <div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4"><div className="text-xs text-amber-300">Expires in next 5 days</div><div className="text-3xl font-black text-white">{reminderCount}</div></div><div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4"><div className="text-xs text-rose-300">Expired licenses</div><div className="text-3xl font-black text-white">{expiredCount}</div></div></div>
    {reminderCount > 0 && <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-sm text-amber-200 flex gap-2"><AlertTriangle size={18}/> Reminder: {reminderCount} license(s) expire within 5 days. Contact customers for renewal.</div>}
    {showForm && <form onSubmit={submit} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-6 space-y-4"><div className="font-bold text-white">{editing ? 'Edit Antivirus License' : 'Add Antivirus License'}</div><div className="grid sm:grid-cols-2 gap-3">
      {([['customerName','Customer Name','text'],['mobile','Mobile Number','tel'],['address','Address','text'],['purchaseDate','Date','date'],['licenseKey','License Key','text'],['antivirusCompany','Antivirus Company','text'],['expiryDate','Expired Date','date']] as const).map(([key,label,type])=><label key={key} className="text-xs text-slate-300 space-y-1">{label}<input required type={type} value={form[key] as string} onChange={e=>update(key,e.target.value)} onClick={e=>type==='date' && (e.currentTarget as HTMLInputElement).showPicker?.()} className="w-full rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-3 text-sm"/></label>)}
    </div><div className="flex gap-2"><button className="rounded-xl bg-violet-600 px-5 py-2.5 text-white font-bold">Save License</button><button type="button" onClick={()=>setShowForm(false)} className="rounded-xl bg-slate-800 px-5 py-2.5 text-slate-200">Cancel</button></div></form>}
    <div className="flex gap-2 items-center rounded-xl border border-slate-700 bg-slate-900 px-3"><Search size={17} className="text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search customer, mobile, company or key" className="w-full bg-transparent py-3 text-sm text-white outline-none"/></div>
    <div className="space-y-3">{filtered.map(x=>{const days=daysUntil(x.expiryDate);return <div key={x.id} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 space-y-3"><div className="flex justify-between gap-2"><div><div className="font-bold text-white">{x.customerName}</div><div className="text-xs text-violet-300">{x.antivirusCompany}</div></div><span className={'text-[11px] font-bold rounded-full px-2 py-1 h-fit '+(days<0?'bg-rose-950 text-rose-300':days<=5?'bg-amber-950 text-amber-300':'bg-emerald-950 text-emerald-300')}>{days<0?'Expired '+Math.abs(days)+'d':days===0?'Expires today':days+' days left'}</span></div><div className="grid grid-cols-2 gap-2 text-xs text-slate-300"><div>Mobile: {x.mobile}</div><div>Purchase: {x.purchaseDate}</div><div>Expiry: {x.expiryDate}</div><div className="break-all">License: {x.licenseKey}</div><div className="col-span-2">Address: {x.address}</div></div><div className="flex gap-2 flex-wrap"><button onClick={()=>wa(x)} className="flex items-center gap-1 rounded-lg bg-emerald-700/70 px-3 py-2 text-xs text-white"><MessageCircle size={14}/> WhatsApp Reminder</button><button onClick={()=>openEdit(x)} className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white"><Pencil size={14}/> Edit</button><button onClick={()=>{if(confirm('Delete this antivirus license?'))onDelete(x.id)}} className="flex items-center gap-1 rounded-lg bg-rose-950 px-3 py-2 text-xs text-rose-200"><Trash2 size={14}/> Delete</button></div></div>})}{filtered.length===0&&<div className="text-center text-sm text-slate-400 py-10">No antivirus licenses added yet.</div>}</div>
  </div>;
};
