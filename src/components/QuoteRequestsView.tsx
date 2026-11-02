import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle2, Send, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type QuoteRow = {
  id: string; customer_name: string; mobile: string; business_name: string | null;
  email: string | null; item_or_service: string; details: string | null;
  status: 'New' | 'Contacted' | 'Quoted' | 'Closed'; created_at: string;
};

interface QuoteRequestsViewProps { isAdmin: boolean; }

export const QuoteRequestsView: React.FC<QuoteRequestsViewProps> = ({ isAdmin }) => {
  const [name,setName]=useState(''); const [mobile,setMobile]=useState('');
  const [business,setBusiness]=useState(''); const [email,setEmail]=useState('');
  const [item,setItem]=useState(''); const [details,setDetails]=useState('');
  const [rows,setRows]=useState<QuoteRow[]>([]); const [busy,setBusy]=useState(false);
  const [saved,setSaved]=useState(false); const [error,setError]=useState('');

  const load = async () => {
    const {data,error}=await supabase.from('quote_requests').select('*').order('created_at',{ascending:false});
    if(error) throw error; setRows((data||[]) as QuoteRow[]);
  };
  useEffect(()=>{ if(isAdmin) void load().catch(e=>setError(e.message||'Could not load quote requests')); },[isAdmin]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if(!name.trim()||!mobile.trim()||!item.trim()){setError('Name, mobile number and product/service are required.');return;}
    setBusy(true);
    const id='PCT-QUOTE-'+new Date().getFullYear()+'-'+Date.now().toString().slice(-6);
    const {error}=await supabase.from('quote_requests').insert({id,customer_name:name.trim(),mobile:mobile.trim(),business_name:business.trim()||null,email:email.trim()||null,item_or_service:item.trim(),details:details.trim()||null});
    setBusy(false);
    if(error){setError('Quote request save nahi hui. Internet check karke dobara try karein.');return;}
    setSaved(true);
  };

  const updateStatus=async(id:string,status:QuoteRow['status'])=>{
    const {error}=await supabase.from('quote_requests').update({status}).eq('id',id);
    if(error){setError(error.message);return;} setRows(old=>old.map(r=>r.id===id?{...r,status}:r));
  };

  if(isAdmin) return <div className="space-y-5">
    <div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-black text-white">Quote Requests</h1><p className="text-xs text-slate-400">Customer quote enquiries saved from the website</p></div><button onClick={()=>void load().catch(e=>setError(e.message))} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200"><RefreshCw className="h-4 w-4"/> Refresh</button></div>
    {error&&<p className="rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-xs text-rose-300">{error}</p>}
    {rows.length===0?<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-400">No quote requests yet.</div>:<div className="space-y-3">{rows.map(r=><div key={r.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2"><div className="flex flex-wrap justify-between gap-2"><strong className="text-white">{r.customer_name}</strong><span className="text-[11px] text-cyan-300">{r.id}</span></div><p className="text-xs text-slate-300">{r.item_or_service}</p><p className="text-xs text-slate-400">Mobile: {r.mobile}{r.business_name?' • '+r.business_name:''}{r.email?' • '+r.email:''}</p>{r.details&&<p className="whitespace-pre-wrap text-xs text-slate-300">{r.details}</p>}<div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] text-slate-500">{new Date(r.created_at).toLocaleString('en-IN')}</span><select value={r.status} onChange={e=>void updateStatus(r.id,e.target.value as QuoteRow['status'])} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"><option>New</option><option>Contacted</option><option>Quoted</option><option>Closed</option></select></div></div>)}</div>}
  </div>;

  if(saved) return <div className="mx-auto max-w-xl rounded-2xl border border-emerald-700 bg-slate-900 p-8 text-center space-y-3"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400"/><h1 className="text-xl font-black text-white">Quote Request Saved!</h1><p className="text-sm text-slate-300">Thank you. PC TECHNO TUNER will contact you soon.</p></div>;
  return <div className="mx-auto max-w-2xl space-y-5"><div className="rounded-2xl border border-cyan-900 bg-slate-900 p-5"><div className="flex items-center gap-3"><FileText className="h-7 w-7 text-cyan-300"/><div><h1 className="text-xl font-black text-white">Request a Quote</h1><p className="text-xs text-slate-400">Fill in your details. Your request will be saved for our team.</p></div></div></div>
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <label className="space-y-1 text-xs text-slate-300">Customer Name *<input required value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      <label className="space-y-1 text-xs text-slate-300">Mobile Number *<input required inputMode="tel" value={mobile} onChange={e=>setMobile(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      <label className="space-y-1 text-xs text-slate-300">Company / Business<input value={business} onChange={e=>setBusiness(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      <label className="space-y-1 text-xs text-slate-300">Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      <label className="sm:col-span-2 space-y-1 text-xs text-slate-300">Product / Service Required *<input required value={item} onChange={e=>setItem(e.target.value)} placeholder="e.g. Laptop, CCTV, Desktop, AMC..." className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      <label className="sm:col-span-2 space-y-1 text-xs text-slate-300">Requirement Details<textarea rows={4} value={details} onChange={e=>setDetails(e.target.value)} placeholder="Quantity, model, location or other details..." className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      {error&&<p className="sm:col-span-2 text-xs text-rose-300">{error}</p>}
      <button disabled={busy} className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><Send className="h-4 w-4"/>{busy?'Saving...':'Save Quote Request'}</button>
    </form>
  </div>;
};
