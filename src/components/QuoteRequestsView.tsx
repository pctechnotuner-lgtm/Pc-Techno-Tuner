import React, { useEffect, useMemo, useState } from 'react';
import { FileText, CheckCircle2, Send, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { CompanyProfile, Product } from '../types';

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
interface QuoteRequestsViewProps { isAdmin: boolean; products?: Product[]; profile: CompanyProfile; }

const money = (value: number) => '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const QuoteRequestsView: React.FC<QuoteRequestsViewProps> = ({ isAdmin, products = [], profile }) => {
  const [catalogue,setCatalogue]=useState<Product[]>(products);
  useEffect(()=>{ if(!isAdmin) void supabase.from('quote_catalogue').select('id,name').eq('active',true).order('name').then(({data,error})=>{ if(!error&&data) setCatalogue(data.map((p:any)=>({id:p.id,name:p.name,sellingPrice:0} as Product))); }); },[isAdmin]);
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
  const [selectedQuoteId,setSelectedQuoteId]=useState<string|null>(null);
  const [editingQuoteId,setEditingQuoteId]=useState<string|null>(null);
  const [editDraft,setEditDraft]=useState<QuoteRow|null>(null);

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
      if(existing) return old.map(item=>item.productId===product.id?{...item,quantity:item.quantity+quantity}:item);
      return [...old,{productId:product.id,name:product.name,quantity,unitPrice:null,lineTotal:null,custom:false}];
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
  const printQuoteDocument=(quote:QuoteRow,draft:QuoteRow)=>{
    setError('');
    const esc=(value:unknown)=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    const dateText=(value:string)=>value?new Date(value).toLocaleDateString('en-GB'):'-';
    const companyAddress=[profile.address,profile.location,profile.pincode].filter(Boolean).join(', ');
    const taxRate=Number(profile.defaultGstRate||0);
    const pricedItems=(draft.items||[]);
    const subtotal=pricedItems.reduce((sum,item)=>sum+(Number(item.lineTotal)||0),0);
    const tax=subtotal*taxRate/100;
    const halfTax=tax/2;
    const total=subtotal+tax;
    const rows=pricedItems.map((item,index)=>'<tr><td>'+(index+1)+'</td><td class="item-name">'+esc(item.name)+(item.custom?'<small>Custom item / service</small>':'')+'</td><td>'+esc(item.quantity)+'</td><td>'+(item.unitPrice===null?'To be quoted':esc(money(item.unitPrice)))+'</td><td>'+(item.lineTotal===null?'Pending':esc(money(item.lineTotal)))+'</td></tr>').join('');
    const emptyRows=Array.from({length:Math.max(0,5-pricedItems.length)}).map(()=>'<tr class="empty"><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>').join('');
    const pending=pricedItems.some(item=>item.lineTotal===null);
    const amountWords=(amount:number)=>{
      const n=Math.round(amount); if(!n)return 'Zero Rupees Only';
      const one=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
      const ten=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
      const under=(v:number)=>{let out='';if(v>=100)out+=one[Math.floor(v/100)]+' Hundred ';v%=100;if(v>=20)out+=ten[Math.floor(v/10)]+(v%10?' '+one[v%10]:'');else if(v)out+=one[v];return out.trim();};
      let v=n;const parts:string[]=[];const crore=Math.floor(v/10000000);v%=10000000;const lakh=Math.floor(v/100000);v%=100000;const thousand=Math.floor(v/1000);v%=1000;
      if(crore)parts.push(under(crore)+' Crore');if(lakh)parts.push(under(lakh)+' Lakh');if(thousand)parts.push(under(thousand)+' Thousand');if(v)parts.push(under(v));return parts.join(' ')+' Rupees Only';
    };
    const html='<!doctype html><html><head><meta charset="utf-8"><title>'+esc(quote.id)+'</title><style>'+
      '@page{size:A4 portrait;margin:8mm}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;color:#111;background:#fff;font:9px/1.25 Arial,Helvetica,sans-serif}.sheet{width:100%;max-width:190mm;min-height:278mm;margin:0 auto;display:flex;flex-direction:column}.caption{display:flex;justify-content:flex-start;align-items:center;gap:8px;margin-bottom:2mm;font-size:11px}.caption span{border:1px solid #888;padding:2px 5px;color:#555;font-size:8px}.header{display:grid;grid-template-columns:1fr 1fr;border:1px solid #222;min-height:27mm}.company{display:flex;align-items:center;gap:7px;padding:6px;border-right:1px solid #222;min-width:0}.logo{width:19mm;height:19mm;object-fit:contain;flex:none}.company h1{font-size:13px;font-weight:800;margin:0 0 3px}.company p{margin:1px 0;overflow-wrap:anywhere}.meta{display:grid;grid-template-columns:repeat(3,1fr);align-items:center;text-align:center}.meta div{padding:4px 3px}.meta b,.meta span{display:block}.meta b{margin-bottom:4px}.parties{display:grid;grid-template-columns:1fr 1fr;border:1px solid #222;border-top:0}.parties section{padding:6px;min-height:24mm}.parties section+section{border-left:1px solid #222}.parties h3,.bottom h3,.footer h3{font-size:8px;font-weight:800;margin:0 0 4px}.parties p{margin:2px 0;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse;table-layout:fixed}.items th,.items td,.gst th,.gst td{border:1px solid #222;padding:5px 3px}.items th,.gst th{background:#ddd;font-weight:800;text-align:center}.items th:nth-child(1){width:7%}.items th:nth-child(2){width:43%}.items th:nth-child(3){width:12%}.items th:nth-child(4){width:17%}.items th:nth-child(5){width:21%}.items td:not(:nth-child(2)){text-align:right}.items td:first-child,.items td:nth-child(3){text-align:center}.item-name{overflow-wrap:anywhere}.item-name small{display:block;color:#555;font-size:7px}.items tr.empty td{height:13mm}.items tfoot td{background:#ddd;font-weight:800}.total-label{text-align:right!important}.gst{margin-top:0;font-size:8px}.gst th,.gst td{text-align:center;padding:4px 3px}.words{border:1px solid #222;border-top:0;padding:6px}.words b,.words span{display:block}.words span{margin-top:3px}.bottom{display:grid;grid-template-columns:1fr 1fr;border:1px solid #222;border-top:0;min-height:25mm}.bottom section{padding:6px}.bottom section+section{border-left:1px solid #222}.bottom p{margin:2px 0}.bottom img{width:22mm;height:22mm;object-fit:contain;float:right}.footer{display:grid;grid-template-columns:1fr 1fr;border:1px solid #222;border-top:0;min-height:22mm;margin-top:auto}.footer section{padding:6px}.footer section+section{border-left:1px solid #222}.footer p{white-space:pre-line;margin:0}.sign{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;text-align:center;gap:3px}.actions{margin:0 0 12px}.actions button{padding:9px 16px;background:#222;color:#fff;border:0;border-radius:0;cursor:pointer}@media screen{body{max-width:900px;margin:20px auto;padding:18px;box-shadow:0 0 10px #aaa}}@media print{.actions{display:none}.sheet{min-height:278mm}}'+
      '</style></head><body><div class="actions"><button onclick="window.print()">Print / Save as PDF</button></div><main class="sheet">'+
      '<div class="caption"><strong>QUOTATION</strong><span>ESTIMATE ONLY • NOT A TAX INVOICE</span></div>'+
      '<div class="header"><div class="company">'+(profile.logoUrl?'<img class="logo" src="'+esc(profile.logoUrl)+'" alt="Company Logo">':'')+'<div><h1>'+esc(profile.name||'PC TECHNO TUNER')+'</h1><p>'+esc(companyAddress)+'</p><p><b>GSTIN:</b> '+esc(profile.gstin||'-')+'　 <b>Mobile:</b> '+esc(profile.mobile||'-')+'</p><p><b>PAN:</b> '+esc(profile.pan||'-')+'</p><p><b>Email:</b> '+esc(profile.email||'-')+'</p><p>'+esc(profile.tagline||'IT Hardware • CCTV Surveillance • Laptop Repairs & AMC Solutions')+'</p></div></div><div class="meta"><div><b>Quote No.</b><span>'+esc(quote.id)+'</span></div><div><b>Date</b><span>'+dateText(quote.created_at)+'</span></div><div><b>Status</b><span>'+esc(quote.status)+'</span></div></div></div>'+
      '<div class="parties"><section><h3>BILL TO</h3><b>'+esc(draft.business_name||draft.customer_name)+'</b>'+(draft.business_name?'<p>'+esc(draft.customer_name)+'</p>':'')+'<p><b>Mobile:</b> '+esc(draft.mobile)+'</p><p><b>Email:</b> '+esc(draft.email||'-')+'</p></section><section><h3>SHIP TO</h3><b>'+esc(draft.business_name||draft.customer_name)+'</b><p><b>Address:</b> As confirmed by customer</p><p><b>Place of Supply:</b> Gujarat</p></section></div>'+
      '<table class="items"><thead><tr><th>S.NO.</th><th>ITEMS / SERVICES</th><th>QTY.</th><th>RATE</th><th>AMOUNT</th></tr></thead><tbody>'+rows+emptyRows+'</tbody><tfoot><tr><td colspan="2" class="total-label">TOTAL</td><td>'+pricedItems.reduce((sum,item)=>sum+Number(item.quantity||0),0)+'</td><td></td><td>'+ (pending?'Pending':esc(money(subtotal)))+'</td></tr></tfoot></table>'+
      '<table class="gst"><thead><tr><th rowspan="2">HSN/SAC</th><th rowspan="2">Taxable Value</th><th colspan="2">CGST</th><th colspan="2">SGST</th><th rowspan="2">Total Tax</th></tr><tr><th>Rate</th><th>Amount</th><th>Rate</th><th>Amount</th></tr></thead><tbody><tr><td>-</td><td>'+esc(money(subtotal))+'</td><td>'+(taxRate/2)+'%</td><td>'+esc(money(halfTax))+'</td><td>'+(taxRate/2)+'%</td><td>'+esc(money(halfTax))+'</td><td>'+esc(money(tax))+'</td></tr></tbody></table>'+
      '<div class="words"><b>Estimated Amount (in words)</b><span>'+(pending?'Final amount will be confirmed after pending item pricing.':amountWords(total))+'</span><p style="text-align:right;font-weight:bold;font-size:14px;margin:7px 0 0">Estimated Total: '+(pending?'To be confirmed':esc(money(total)))+'</p></div>'+
      '<div class="bottom"><section><h3>Bank Details</h3><p><b>Name:</b> '+esc(profile.name||'PC TECHNO TUNER')+'</p><p><b>IFSC Code:</b> '+esc(profile.ifscCode||'-')+'</p><p><b>Account No:</b> '+esc(profile.accountNumber||'-')+'</p><p><b>Bank:</b> '+esc(profile.bankName||'-')+'</p></section><section><h3>Payment QR Code</h3>'+(profile.upiId?'<img alt="UPI QR Code" src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data='+encodeURIComponent('upi://pay?pa='+profile.upiId+'&pn='+(profile.name||'PC TECHNO TUNER'))+'"><p><b>UPI ID:</b> '+esc(profile.upiId)+'</p>':'<p>UPI ID not configured</p>')+'<p>Payment due after order confirmation.</p></section></div>'+
      '<div class="footer"><section><h3>Terms and Conditions</h3><p>'+esc(profile.terms||'Prices and availability are subject to confirmation. This is an estimate, not a tax invoice.')+'</p></section><section class="sign"><b>Authorised Signatory For</b><strong>'+esc(profile.name||'PC TECHNO TUNER')+'</strong></section></div></main></body></html>';
    const frame=document.createElement('iframe');
    frame.setAttribute('title','Quotation PDF print');
    frame.style.position='fixed';frame.style.right='0';frame.style.bottom='0';frame.style.width='1px';frame.style.height='1px';frame.style.border='0';frame.style.opacity='0.01';
    document.body.appendChild(frame);
    const cleanup=()=>{window.setTimeout(()=>frame.remove(),1000);};
    frame.onload=()=>{
      const win=frame.contentWindow;
      if(!win){setError('Print window open nahi hui. Browser print permission check karein.');cleanup();return;}
      const images=Array.from(win.document.images);
      Promise.all(images.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=()=>resolve(true);img.onerror=()=>resolve(false);window.setTimeout(()=>resolve(false),2500);}))).then(()=>{
        win.focus();win.print();
        win.onafterprint=cleanup;
        window.setTimeout(cleanup,60000);
      });
    };
    const doc=frame.contentDocument;
    if(!doc){setError('PDF document create nahi hua.');frame.remove();return;}
    doc.open();doc.write(html);doc.close();
  };
  const updateStatus=async(id:string,status:QuoteRow['status'])=>{
    const {error}=await supabase.from('quote_requests').update({status}).eq('id',id);
    if(error){setError(error.message);return;} setRows(old=>old.map(r=>r.id===id?{...r,status}:r));
  };


  if(isAdmin) {
    const selectedQuote=rows.find(row=>row.id===selectedQuoteId);
    if(selectedQuote) {
      const draft=editDraft?.id===selectedQuote.id?editDraft:selectedQuote;
      const draftItems=draft.items||[];
      return <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><button type="button" onClick={()=>{setSelectedQuoteId(null);setEditDraft(null);setError('');}} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-white">← Back</button><div><h1 className="text-xl font-black text-white">Quote Details</h1><p className="text-xs text-slate-400">{selectedQuote.id}</p></div></div>
          <div className="flex flex-wrap items-center gap-2"><select aria-label="Quote status" value={selectedQuote.status} onChange={e=>void updateStatus(selectedQuote.id,e.target.value as QuoteRow['status'])} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"><option>New</option><option>Contacted</option><option>Quoted</option><option>Closed</option></select><button type="button" onClick={()=>printQuoteDocument(selectedQuote,draft)} className="rounded-lg border border-cyan-700 px-3 py-2 text-xs font-bold text-cyan-200">Save / Print PDF</button></div>
        </div>
        {error&&<p className="rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-xs text-rose-300">{error}</p>}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6 space-y-5">
          <div><h2 className="text-sm font-bold text-white">Customer Information</h2><p className="text-xs text-slate-500">Details edit karke Save Changes karein.</p></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-slate-400">Customer Name<input value={draft.customer_name} onChange={e=>updateDraftField('customer_name',e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
            <label className="space-y-1 text-xs text-slate-400">Mobile Number<input value={draft.mobile} onChange={e=>updateDraftField('mobile',e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
            <label className="space-y-1 text-xs text-slate-400">Company / Business<input value={draft.business_name||''} onChange={e=>updateDraftField('business_name',e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
            <label className="space-y-1 text-xs text-slate-400">Email<input value={draft.email||''} onChange={e=>updateDraftField('email',e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
          </div>
          <div className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-white">Items / Services</h2><span className="text-xs text-slate-400">{draftItems.length} items</span></div>
            {draftItems.map((item,index)=><div key={index} className="grid grid-cols-1 gap-2 rounded-lg border border-slate-800 bg-slate-950 p-3 sm:grid-cols-[minmax(0,1fr)_90px_130px_120px_auto]">
              <label className="text-[11px] text-slate-500">Item Name<input value={item.name} onChange={e=>updateDraftItem(index,'name',e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"/></label>
              <label className="text-[11px] text-slate-500">Quantity<input type="number" min="1" value={item.quantity} onChange={e=>updateDraftItem(index,'quantity',e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"/></label>
              <label className="text-[11px] text-slate-500">Unit Price<input type="number" min="0" step="0.01" value={item.unitPrice??''} onChange={e=>updateDraftItem(index,'unitPrice',e.target.value)} placeholder="Enter price" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"/></label>
              <div className="flex items-end pb-2 text-xs font-bold text-cyan-300">{item.lineTotal===null?'Price Pending':money(item.lineTotal)}</div>
              <button type="button" onClick={()=>removeDraftItem(index)} className="self-end rounded-lg bg-rose-950 px-3 py-2 text-xs text-rose-200">Remove</button>
            </div>)}
            <div className="text-right text-lg font-black text-cyan-300">Grand Total: {money(draftItems.reduce((sum,item)=>sum+(item.lineTotal||0),0))}</div>
          </div>
          <label className="block space-y-1 text-xs text-slate-400">Additional Details<textarea rows={4} value={draft.details||''} onChange={e=>updateDraftField('details',e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
          <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>void saveEdit()} className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy?'Saving...':'Save Changes'}</button><button type="button" onClick={()=>printQuoteDocument(selectedQuote,draft)} className="rounded-lg border border-cyan-700 px-5 py-3 text-sm font-bold text-cyan-200">Save as PDF</button></div>
          <p className="text-[11px] text-slate-500">Request received: {new Date(selectedQuote.created_at).toLocaleString('en-IN')}</p>
        </div>

      </div>;
    }
    return <div className="space-y-4">
      <div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-black text-white">Quote Requests</h1><p className="text-xs text-slate-400">Customer name par click karke alag details form kholen</p></div><button onClick={()=>void load().catch(e=>setError(e.message))} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200"><RefreshCw className="h-4 w-4"/> Refresh</button></div>
      {error&&<p className="rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-xs text-rose-300">{error}</p>}
      {rows.length===0?<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-400">No quote requests yet.</div>:<div className="space-y-2">{rows.map(r=><div key={r.id} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 sm:px-4">
        <button type="button" onClick={()=>{setSelectedQuoteId(r.id);setEditDraft({...r,items:(r.items||[]).map(item=>({...item}))});setError('');}} className="min-w-0 flex-1 text-left">
          <div className="flex min-w-0 items-center gap-2"><span className="shrink-0 text-xs font-bold text-white hover:text-cyan-300">{r.customer_name}</span><span className="hidden sm:inline text-[11px] text-slate-400">{r.mobile}</span><span className="min-w-0 flex-1 truncate text-[11px] text-slate-400">{(r.items||[]).map(item=>item.name).join(', ')||r.item_or_service}</span><span className="shrink-0 text-[10px] text-cyan-300">{r.id}</span></div>
          <div className="mt-1 text-[10px] text-slate-500">{new Date(r.created_at).toLocaleDateString('en-IN')}</div>
        </button>
        <select aria-label={'Status for '+r.customer_name} value={r.status} onChange={e=>void updateStatus(r.id,e.target.value as QuoteRow['status'])} className="shrink-0 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-[11px] text-white"><option>New</option><option>Contacted</option><option>Quoted</option><option>Closed</option></select>
      </div>)}</div>}
    </div>;
  }

  if(saved) return <div className="mx-auto max-w-xl rounded-2xl border border-emerald-700 bg-slate-900 p-8 text-center space-y-3"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400"/><h1 className="text-xl font-black text-white">Quote Request Saved!</h1><p className="text-sm text-slate-300">Thank you. PC TECHNO TUNER will contact you soon.</p></div>;
  return <div className="mx-auto max-w-2xl space-y-5"><div className="rounded-2xl border border-cyan-900 bg-slate-900 p-5"><div className="flex items-center gap-3"><FileText className="h-7 w-7 text-cyan-300"/><div><h1 className="text-xl font-black text-white">Request a Quote</h1><p className="text-xs text-slate-400">Products select karein. Price customer ko nahi dikhegi; PC TECHNO TUNER team quotation bhejegi.</p></div></div></div>
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <label className="space-y-1 text-xs text-slate-300">Customer Name *<input required value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      <label className="space-y-1 text-xs text-slate-300">Mobile Number *<input required inputMode="tel" value={mobile} onChange={e=>setMobile(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      <label className="space-y-1 text-xs text-slate-300">Company / Business<input value={business} onChange={e=>setBusiness(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      <label className="space-y-1 text-xs text-slate-300">Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      <div className="sm:col-span-2 rounded-xl border border-slate-700 p-3 space-y-3">
        <h2 className="text-sm font-bold text-white">Add Items from Our Catalogue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_auto] gap-2">
          <select value={selectedProduct} onChange={e=>setSelectedProduct(e.target.value)} className="min-w-0 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"><option value="">Select item / service</option>{catalogue.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
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
        {cart.length>0&&<div className="space-y-2 pt-2">{cart.map((item,index)=><div key={index} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-950 p-3"><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white">{item.name}</p><p className="text-[11px] text-slate-400">Price will be provided by our team</p></div><input type="number" min="1" value={item.quantity} onChange={e=>changeQuantity(index,Math.max(1,Number(e.target.value)||1))} className="w-20 rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white" aria-label="Item quantity"/><strong className="w-24 text-right text-sm text-cyan-300">{item.lineTotal===null?'Pending':money(item.lineTotal)}</strong><button type="button" onClick={()=>setCart(old=>old.filter((_,i)=>i!==index))} aria-label="Remove item" className="rounded p-2 text-rose-300"><Trash2 className="h-4 w-4"/></button></div>)}
          <div className="text-right text-base font-black text-white">Grand Total: {money(subtotal)}{cart.some(item=>item.unitPrice===null)&&<p className="text-[11px] font-normal text-amber-300">Other item(s) price will be quoted separately.</p>}</div>
        </div>}
      </div>
      <label className="sm:col-span-2 space-y-1 text-xs text-slate-300">Additional Details<textarea rows={3} value={details} onChange={e=>setDetails(e.target.value)} placeholder="Model, requirement, location or other details..." className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"/></label>
      {error&&<p className="sm:col-span-2 text-xs text-rose-300">{error}</p>}
      <button disabled={busy||cart.length===0} className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><Send className="h-4 w-4"/>{busy?'Saving...':'Save Quote Request'}</button>
    </form>
  </div>;
};
