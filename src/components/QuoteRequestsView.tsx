import React, { useEffect, useMemo, useState } from 'react';
import { FileText, CheckCircle2, Send, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

type QuoteItem = {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
  custom: boolean;
};
type QuoteRow = {
  id: string; customer_name: string; mobile: string; business_name: string | null;
  email: string | null; item_or_service: string; details: string | null;
  items?: QuoteItem[] | null; subtotal?: number | null;
  status: 'New' | 'Contacted' | 'Quoted' | 'Closed'; created_at: string;
};
interface QuoteRequestsViewProps { isAdmin: boolean; products?: Product[]; }

const money = (value: number) => '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const QuoteRequestsView: React.FC<QuoteRequestsViewProps> = ({ isAdmin, products = [] }) => {
  const [catalogue,setCatalogue]=useState<Product[]>(products);
  useEffect(()=>{ if(!isAdmin) void supabase.from('quote_catalogue').select('id,name,selling_price').eq('active',true).order('name').then(({data,error})=>{ if(!error&&data) setCatalogue(data.map((p:any)=>({id:p.id,name:p.name,sellingPrice:Number(p.selling_price)} as Product))); }); },[isAdmin]);
  const [name,setName]=useState(''); const [mobile,setMobile]=useState('');
  const [business,setBusiness]=useState(''); const [email,setEmail]=useState('');
  const [details,setDetails]=useState('');
  const [selectedProduct,setSelectedProduct]=useState('');
  const [quantity,setQuantity]=useState(1);
  const [customName,setCustomName]=useState('');
  const [customQuantity,setCustomQuantity]=useState(1);
  const [cart,setCart]=useState<QuoteItem[]>([]);
  const [rows,setRows]=useState<QuoteRow[]>([]); const [busy,setBusy]=useState(false);
  const [saved,setSaved]=useState(false); const [error,setError]=useState('');

  const subtotal = useMemo(() => cart.reduce((sum,item)=>sum+(item.lineTotal||0),0),[cart]);
  const load = async () => {
    const {data,error}=await supabase.from('quote_requests').select('*').order('created_at',{ascending:false});
    if(error) throw error; setRows((data||[]) as QuoteRow[]);
  };
  useEffect(()=>{ if(isAdmin) void load().catch(e=>setError(e.message||'Could not load quote requests')); },[isAdmin]);

  const addProduct = () => {
    const product=catalogue.find(p=>p.id===selectedProduct);
    if(!product) return;
    setCart(old=>{
      const existing=old.find(item=>item.productId===product.id);
      if(existing) return old.map(item=>item.productId===product.id?{...item,quantity:item.quantity+quantity,lineTotal:(item.quantity+quantity)*item.unitPrice!}:item);
      return [...old,{productId:product.id,name:product.name,quantity,unitPrice:product.sellingPrice,lineTotal:product.sellingPrice*quantity,custom:false}];
    });
    setSelectedProduct(''); setQuantity(1);
  };
  const addCustom = () => {
    if(!customName.trim()) return;
    setCart(old=>[...old,{name:customName.trim(),quantity:customQuantity,unitPrice:null,lineTotal:null,custom:true}]);
    setCustomName(''); setCustomQuantity(1);
  };
  const changeQuantity = (index:number,next:number) => setCart(old=>old.map((item,i)=>i===index?{...item,quantity:next,lineTotal:item.unitPrice===null?null:item.unitPrice*next}:item));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if(!name.trim()||!mobile.trim()||cart.length===0){setError('Name, mobile number aur kam se kam ek item add karna zaroori hai.');return;}
    setBusy(true);
    const id='PCT-QUOTE-'+new Date().getFullYear()+'-'+Date.now().toString().slice(-6);
    const itemSummary=cart.map(item=>item.name).join(', ');
    const {error}=await supabase.from('quote_requests').insert({
      id,customer_name:name.trim(),mobile:mobile.trim(),business_name:business.trim()||null,
      email:email.trim()||null,item_or_service:itemSummary,details:details.trim()||null,
      items:cart,subtotal
    });
    setBusy(false);
    if(error){setError('Quote request save nahi hui. Internet check karke dobara try karein.');return;}
    setSaved(true);
  };

  const updateStatus=async(id:string,status:QuoteRow['status'])=>{
    const {error}=await supabase.from('quote_requests').update({status}).eq('id',id);
    if(error){setError(error.message);return;} setRows(old=>old.map(r=>r.id===id?{...r,status}:r));
  };

  if(isAdmin) return <div className="space-y-5">
    <div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-black text-white">Quote Requests</h1><p className="text-xs text-slate-400">Customer quote enquiries and selected items</p></div><button onClick={()=>void load().catch(e=>setError(e.message))} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200"><RefreshCw className="h-4 w-4"/> Refresh</button></div>
    {error&&<p className="rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-xs text-rose-300">{error}</p>}
    {rows.length===0?<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-400">No quote requests yet.</div>:<div className="space-y-3">{rows.map(r=>{
      const items=r.items||[];
      return <div key={r.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
        <div className="flex flex-wrap justify-between gap-2"><strong className="text-white">{r.customer_name}</strong><span className="text-[11px] text-cyan-300">{r.id}</span></div>
        <p className="text-xs text-slate-400">Mobile: {r.mobile}{r.business_name?' • '+r.business_name:''}{r.email?' • '+r.email:''}</p>
        {items.length>0?<div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-slate-500"><tr><th className="py-2 text-left">Item</th><th className="py-2 text-center">Qty</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Total</th></tr></thead><tbody>{items.map((item,i)=><tr key={i} className="border-t border-slate-800"><td className="py-2 text-slate-200">{item.name}{item.custom&&<span className="ml-2 text-amber-300">Price to be quoted</span>}</td><td className="py-2 text-center text-slate-300">{item.quantity}</td><td className="py-2 text-right text-slate-300">{item.unitPrice===null?'—':money(item.unitPrice)}</td><td className="py-2 text-right text-white">{item.lineTotal===null?'Pending':money(item.lineTotal)}</td></tr>)}</tbody></table><div className="pt-2 text-right text-sm font-bold text-cyan-300">Known-price subtotal: {money(Number(r.subtotal||0))}</div></div>:<p className="text-xs text-slate-300">{r.item_or_service}</p>}
        {r.details&&<p className="whitespace-pre-wrap text-xs text-slate-300">{r.details}</p>}
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] text-slate-500">{new Date(r.created_at).toLocaleString('en-IN')}</span><select value={r.status} onChange={e=>void updateStatus(r.id,e.target.value as QuoteRow['status'])} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"><option>New</option><option>Contacted</option><option>Quoted</option><option>Closed</option></select></div>
      </div>;
    })}</div>}
  </div>;

  if(saved) return <div className="mx-auto max-w-xl rounded-2xl border border-emerald-700 bg-slate-900 p-8 text-center space-y-3"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400"/><h1 className="text-xl font-black text-white">Quote Request Saved!</h1><p className="text-sm text-slate-300">Thank you. PC TECHNO TUNER will contact you soon.</p></div>;
  return <div className="mx-auto max-w-2xl space-y-5"><div className="rounded-2xl border border-cyan-900 bg-slate-900 p-5"><div className="flex items-center gap-3"><FileText className="h-7 w-7 text-cyan-300"/><div><h1 className="text-xl font-black text-white">Request a Quote</h1><p className="text-xs text-slate-400">Items add karein; listed items ki price automatic calculate hogi.</p></div></div></div>
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <label className="space-y-1 text-xs text-slate-300">Customer Name *<input required value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      <label className="space-y-1 text-xs text-slate-300">Mobile Number *<input required inputMode="tel" value={mobile} onChange={e=>setMobile(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      <label className="space-y-1 text-xs text-slate-300">Company / Business<input value={business} onChange={e=>setBusiness(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      <label className="space-y-1 text-xs text-slate-300">Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      <div className="sm:col-span-2 rounded-xl border border-slate-700 p-3 space-y-3">
        <h2 className="text-sm font-bold text-white">Add Items from Our Catalogue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_auto] gap-2">
          <select value={selectedProduct} onChange={e=>setSelectedProduct(e.target.value)} className="min-w-0 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"><option value="">Select item / service</option>{catalogue.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(p=><option key={p.id} value={p.id}>{p.name} — {money(p.sellingPrice)}</option>)}</select>
          <input type="number" min="1" value={quantity} onChange={e=>setQuantity(Math.max(1,Number(e.target.value)||1))} className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white" aria-label="Quantity"/>
          <button type="button" onClick={addProduct} disabled={!selectedProduct} className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"><Plus className="h-4 w-4"/> Add</button>
        </div>
        <div className="border-t border-slate-800 pt-3 space-y-2">
          <p className="text-xs font-semibold text-amber-300">Item not listed? Add it without a price</p>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_auto] gap-2">
            <input value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="Enter item / service name" className="min-w-0 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/>
            <input type="number" min="1" value={customQuantity} onChange={e=>setCustomQuantity(Math.max(1,Number(e.target.value)||1))} className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white" aria-label="Custom item quantity"/>
            <button type="button" onClick={addCustom} disabled={!customName.trim()} className="inline-flex items-center justify-center gap-1 rounded-lg border border-amber-700 px-4 py-3 text-sm font-bold text-amber-200 disabled:opacity-40"><Plus className="h-4 w-4"/> Add Other</button>
          </div>
        </div>
        {cart.length>0&&<div className="space-y-2 pt-2">{cart.map((item,index)=><div key={index} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-950 p-3"><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white">{item.name}</p><p className="text-[11px] text-slate-400">{item.unitPrice===null?'Price will be provided by our team':money(item.unitPrice)+' each'}</p></div><input type="number" min="1" value={item.quantity} onChange={e=>changeQuantity(index,Math.max(1,Number(e.target.value)||1))} className="w-20 rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white" aria-label="Item quantity"/><strong className="w-24 text-right text-sm text-cyan-300">{item.lineTotal===null?'Pending':money(item.lineTotal)}</strong><button type="button" onClick={()=>setCart(old=>old.filter((_,i)=>i!==index))} aria-label="Remove item" className="rounded p-2 text-rose-300"><Trash2 className="h-4 w-4"/></button></div>)}
          <div className="text-right text-base font-black text-white">Grand Total: {money(subtotal)}{cart.some(item=>item.unitPrice===null)&&<p className="text-[11px] font-normal text-amber-300">Other item(s) price will be quoted separately.</p>}</div>
        </div>}
      </div>
      <label className="sm:col-span-2 space-y-1 text-xs text-slate-300">Additional Details<textarea rows={3} value={details} onChange={e=>setDetails(e.target.value)} placeholder="Model, requirement, location or other details..." className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      {error&&<p className="sm:col-span-2 text-xs text-rose-300">{error}</p>}
      <button disabled={busy||cart.length===0} className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><Send className="h-4 w-4"/>{busy?'Saving...':'Save Quote Request'}</button>
    </form>
  </div>;
};
