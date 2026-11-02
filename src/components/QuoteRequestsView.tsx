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
  const [expandedQuoteId,setExpandedQuoteId]=useState<string|null>(null);
  const [editingQuoteId,setEditingQuoteId]=useState<string|null>(null);
  const [editDraft,setEditDraft]=useState<QuoteRow|null>(null);
  const [printQuoteId,setPrintQuoteId]=useState<string|null>(null);

  const subtotal = useMemo(() => cart.reduce((sum,item)=>sum+(item.lineTotal||0),0),[cart]);
  const load = async () => {
    const {data,error}=await supabase.from('quote_requests').select('*').order('created_at',{ascending:false});
    if(error) throw error; setRows((data||[]) as QuoteRow[]);
  };
  useEffect(()=>{ if(isAdmin) void load().catch(e=>setError(e.message||'Could not load quote requests')); },[isAdmin]);
  useEffect(()=>{ if(!printQuoteId) return; const done=()=>setPrintQuoteId(null); window.addEventListener('afterprint',done); window.print(); return ()=>window.removeEventListener('afterprint',done); },[printQuoteId]);

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

  const startEdit=(row:QuoteRow)=>{setEditingQuoteId(row.id);setEditDraft({...row,items:(row.items||[]).map(item=>({...item}))});};
  const updateDraftField=(field:'customer_name'|'mobile'|'business_name'|'email'|'details',value:string)=>setEditDraft(old=>old?{...old,[field]:value}:old);
  const updateDraftItem=(index:number,field:'name'|'quantity'|'unitPrice',value:string)=>setEditDraft(old=>{if(!old)return old;const items=[...(old.items||[])];const item={...items[index]};if(field==='name')item.name=value;if(field==='quantity')item.quantity=Math.max(1,Number(value)||1);if(field==='unitPrice')item.unitPrice=value===''?null:Math.max(0,Number(value)||0);item.lineTotal=item.unitPrice===null?null:item.unitPrice*item.quantity;items[index]=item;return {...old,items,subtotal:items.reduce((sum,x)=>sum+(x.lineTotal||0),0),item_or_service:items.map(x=>x.name).join(', ')};});
  const removeDraftItem=(index:number)=>setEditDraft(old=>{if(!old)return old;const items=(old.items||[]).filter((_,i)=>i!==index);return {...old,items,subtotal:items.reduce((sum,x)=>sum+(x.lineTotal||0),0),item_or_service:items.map(x=>x.name).join(', ')};});
  const saveEdit=async()=>{if(!editDraft)return;if(!editDraft.customer_name.trim()||!editDraft.mobile.trim()){setError('Customer name aur mobile number zaroori hain.');return;}setBusy(true);setError('');const items=editDraft.items||[];const payload={customer_name:editDraft.customer_name.trim(),mobile:editDraft.mobile.trim(),business_name:editDraft.business_name?.trim()||null,email:editDraft.email?.trim()||null,details:editDraft.details||null,items,item_or_service:items.map(x=>x.name).join(', ')||editDraft.item_or_service,subtotal:items.reduce((sum,x)=>sum+(x.lineTotal||0),0)};const {error}=await supabase.from('quote_requests').update(payload).eq('id',editDraft.id);setBusy(false);if(error){setError(error.message||'Quote update nahi hua.');return;}setRows(old=>old.map(row=>row.id===editDraft.id?{...row,...payload}:row));setEditingQuoteId(null);setEditDraft(null);};
  const updateStatus=async(id:string,status:QuoteRow['status'])=>{
    const {error}=await supabase.from('quote_requests').update({status}).eq('id',id);
    if(error){setError(error.message);return;} setRows(old=>old.map(r=>r.id===id?{...r,status}:r));
  };

<style>{`.quote-print-area{display:none}@media print{@page{size:A4;margin:14mm}body *{visibility:hidden!important}.quote-print-area[data-print-active="true"],.quote-print-area[data-print-active="true"] *{visibility:visible!important}.quote-print-area[data-print-active="true"]{display:block!important;position:absolute!important;left:0;top:0;width:100%;color:#111!important;background:#fff!important}.quote-print-sheet{font-family:Arial,sans-serif;color:#111;font-size:11px}.quote-print-header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #164b82;padding-bottom:12px;margin-bottom:16px}.quote-print-header h1{font-size:22px;margin:0;color:#164b82}.quote-print-header p{margin:4px 0}.quote-print-header strong{font-size:18px}.quote-print-meta{display:flex;justify-content:space-between;gap:10px;margin:12px 0}.quote-print-sheet h3{background:#edf3fa;padding:7px;margin:14px 0 8px;font-size:12px}.quote-print-sheet p{margin:6px 0}.quote-print-sheet table{width:100%;border-collapse:collapse;margin-top:8px}.quote-print-sheet th,.quote-print-sheet td{border:1px solid #999;padding:8px;text-align:left}.quote-print-sheet th{background:#edf3fa}.quote-print-total{text-align:right;font-weight:bold;font-size:14px;margin-top:12px!important}.quote-print-foot{border-top:1px solid #aaa;padding-top:12px;margin-top:28px!important;font-size:10px}}`}</style>
  if(isAdmin) return <div className="space-y-4">
    <div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-black text-white">Quote Requests</h1><p className="text-xs text-slate-400">Customer enquiries — click a row to view full details</p></div><button onClick={()=>void load().catch(e=>setError(e.message))} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200"><RefreshCw className="h-4 w-4"/> Refresh</button></div>
    {error&&<p className="rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-xs text-rose-300">{error}</p>}
    {rows.length===0?<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-400">No quote requests yet.</div>:<div className="space-y-2">{rows.map(r=>{
      const items=r.items||[];
      const isExpanded=expandedQuoteId===r.id;
      const itemNames=items.length?items.map(item=>item.name).join(', '):r.item_or_service;
      return <div key={r.id} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
          <button type="button" onClick={()=>setExpandedQuoteId(isExpanded?null:r.id)} aria-expanded={isExpanded} className="min-w-0 flex-1 text-left">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-xs font-bold text-white">{r.customer_name}</span>
              <span className="hidden sm:inline text-[11px] text-slate-400">{r.mobile}</span>
              <span className="min-w-0 flex-1 truncate text-[11px] text-slate-400">{itemNames}</span>
              <span className="shrink-0 text-[10px] text-cyan-300">{r.id}</span>
              <span className="shrink-0 text-slate-400">{isExpanded?'▴':'▾'}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 sm:hidden"><span>{r.mobile}</span><span>•</span><span>{new Date(r.created_at).toLocaleDateString('en-IN')}</span></div>
          </button>
          <select aria-label={'Status for '+r.customer_name} value={r.status} onChange={e=>void updateStatus(r.id,e.target.value as QuoteRow['status'])} className="shrink-0 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-[11px] text-white"><option>New</option><option>Contacted</option><option>Quoted</option><option>Closed</option></select>
        </div>
        {isExpanded&&<div className="space-y-3 border-t border-slate-800 bg-slate-950/50 p-4">
          {editingQuoteId===r.id&&editDraft?<>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs text-slate-400">Customer Name<input value={editDraft.customer_name} onChange={e=>updateDraftField('customer_name',e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"/></label>
              <label className="space-y-1 text-xs text-slate-400">Mobile<input value={editDraft.mobile} onChange={e=>updateDraftField('mobile',e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"/></label>
              <label className="space-y-1 text-xs text-slate-400">Business<input value={editDraft.business_name||''} onChange={e=>updateDraftField('business_name',e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"/></label>
              <label className="space-y-1 text-xs text-slate-400">Email<input value={editDraft.email||''} onChange={e=>updateDraftField('email',e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"/></label>
            </div>
            <div className="space-y-2"><div className="text-xs font-bold text-slate-300">Edit Items — quantity and price</div>
              {(editDraft.items||[]).map((item,index)=><div key={index} className="grid grid-cols-1 gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3 sm:grid-cols-[minmax(0,1fr)_75px_110px_auto]"><input value={item.name} onChange={e=>updateDraftItem(index,'name',e.target.value)} aria-label="Item name" className="min-w-0 rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white"/><input type="number" min="1" value={item.quantity} onChange={e=>updateDraftItem(index,'quantity',e.target.value)} aria-label="Quantity" className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white"/><input type="number" min="0" step="0.01" value={item.unitPrice??''} onChange={e=>updateDraftItem(index,'unitPrice',e.target.value)} placeholder="Set price" aria-label="Unit price" className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white"/><button type="button" onClick={()=>removeDraftItem(index)} className="rounded-lg bg-rose-950 px-3 py-2 text-xs text-rose-200">Remove</button><p className="text-[11px] text-cyan-300 sm:col-span-4">Total: {item.lineTotal===null?'Pending':money(item.lineTotal)}</p></div>)}
              <p className="text-right text-sm font-black text-cyan-300">Grand Total: {money(editDraft.items?.reduce((sum,item)=>sum+(item.lineTotal||0),0)||0)}</p>
            </div>
            <label className="block space-y-1 text-xs text-slate-400">Additional Details<textarea rows={3} value={editDraft.details||''} onChange={e=>updateDraftField('details',e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"/></label>
            <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>void saveEdit()} className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{busy?'Saving...':'Save Changes'}</button><button type="button" onClick={()=>{setEditingQuoteId(null);setEditDraft(null);}} className="rounded-lg bg-slate-800 px-4 py-2 text-xs text-white">Cancel Edit</button></div>
          </>:<>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2"><p className="text-slate-300"><span className="text-slate-500">Customer:</span> {r.customer_name}</p><p className="text-slate-300"><span className="text-slate-500">Mobile:</span> {r.mobile}</p><p className="text-slate-300"><span className="text-slate-500">Business:</span> {r.business_name||'—'}</p><p className="text-slate-300"><span className="text-slate-500">Email:</span> {r.email||'—'}</p><p className="text-slate-300 sm:col-span-2"><span className="text-slate-500">Request ID:</span> {r.id}</p></div>
            {items.length>0?<div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-slate-500"><tr><th className="py-2 text-left">Item</th><th className="py-2 text-center">Qty</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Total</th></tr></thead><tbody>{items.map((item,i)=><tr key={i} className="border-t border-slate-800"><td className="py-2 text-slate-200">{item.name}{item.custom&&<span className="ml-2 text-amber-300">Price to be quoted</span>}</td><td className="py-2 text-center text-slate-300">{item.quantity}</td><td className="py-2 text-right text-slate-300">{item.unitPrice===null?'—':money(item.unitPrice)}</td><td className="py-2 text-right text-white">{item.lineTotal===null?'Pending':money(item.lineTotal)}</td></tr>)}</tbody></table><div className="pt-2 text-right text-sm font-bold text-cyan-300">Known-price subtotal: {money(Number(r.subtotal||0))}</div></div>:<p className="text-xs text-slate-300">{r.item_or_service}</p>}
            {r.details&&<div className="rounded-lg border border-slate-800 bg-slate-900 p-3"><p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Additional Details</p><p className="whitespace-pre-wrap text-xs text-slate-300">{r.details}</p></div>}
            <p className="text-[10px] text-slate-500">Submitted: {new Date(r.created_at).toLocaleString('en-IN')}</p>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={()=>startEdit(r)} className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white">Edit Quote</button><button type="button" onClick={()=>setPrintQuoteId(r.id)} className="rounded-lg border border-cyan-700 px-4 py-2 text-xs font-bold text-cyan-200">Save / Print PDF</button></div>
          </>}
        </div>
        <div className="quote-print-area" data-print-active={printQuoteId===r.id?'true':'false'}><div className="quote-print-sheet">
          <div className="quote-print-header"><div><h1>PC TECHNO TUNER</h1><p>IT Hardware • CCTV Surveillance • Laptop Repairs & AMC Solutions</p></div><strong>QUOTATION</strong></div>
          <div className="quote-print-meta"><span><b>Quote ID:</b> {r.id}</span><span><b>Date:</b> {new Date(r.created_at).toLocaleDateString('en-IN')}</span><span><b>Status:</b> {r.status}</span></div>
          <h3>Customer Details</h3><p><b>Name:</b> {r.customer_name}　 <b>Mobile:</b> {r.mobile}</p><p><b>Business:</b> {r.business_name||'—'}　 <b>Email:</b> {r.email||'—'}</p>
          <h3>Items / Services</h3><table><thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>{items.map((item,i)=><tr key={i}><td>{item.name}</td><td>{item.quantity}</td><td>{item.unitPrice===null?'To be quoted':money(item.unitPrice)}</td><td>{item.lineTotal===null?'Pending':money(item.lineTotal)}</td></tr>)}</tbody></table>
          <p className="quote-print-total">Known-price subtotal: {money(Number(r.subtotal||0))}</p>{r.details&&<><h3>Additional Details</h3><p>{r.details}</p></>}<p className="quote-print-foot">This is a quotation enquiry / estimate. Final pricing and availability will be confirmed by PC TECHNO TUNER.</p>
        </div></div>
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
