import React, { useMemo, useState } from 'react';
import { Invoice, Product, Estimate, Customer, CompanyProfile, InvoiceItem } from '../types';
import { TrendingUp, ChevronDown, ChevronUp, Search, Plus, Printer, Trash2 } from 'lucide-react';

interface Props {
  invoices: Invoice[];
  products: Product[];
  estimates: Estimate[];
  customers: Customer[];
  profile: CompanyProfile;
  onSaveEstimate: (estimate: Estimate) => void;
}

const money = (value: number) => '₹' + (Number(value) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));

export const EstimatedProfitView: React.FC<Props> = ({ invoices, products, estimates, customers, profile, onSaveEstimate }) => {
  const [search, setSearch] = useState('');
  const [expandedParty, setExpandedParty] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [business, setBusiness] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [estimateDate, setEstimateDate] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));
  const [taxRate, setTaxRate] = useState(profile.defaultGstRate || 18);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ productId: '', description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }]);

  const subtotal = items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);
  const taxAmount = Math.round(subtotal * taxRate) / 100;
  const total = Math.max(0, subtotal + taxAmount - discount);
  const cost = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? (product.purchasePrice || 0) * (Number(item.quantity) || 0) : 0);
  }, 0);
  const estimatedProfit = subtotal - discount - cost;

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].lineTotal = Math.round((Number(updated[index].quantity) || 0) * (Number(updated[index].unitPrice) || 0) * 100) / 100;
    }
    setItems(updated);
  };

  const selectProduct = (index: number, id: string) => {
    const product = products.find((p) => p.id === id);
    const updated = [...items];
    if (!product) {
      updated[index] = { ...updated[index], productId: '', description: '', unitPrice: 0, lineTotal: 0 };
    } else {
      const base = Math.round((product.sellingPrice / (1 + taxRate / 100)) * 100) / 100;
      updated[index] = {
        productId: product.id,
        description: [product.name, product.brand, product.model].filter(Boolean).join(' '),
        category: product.category,
        quantity: 1,
        unitPrice: base,
        lineTotal: base,
      };
    }
    setItems(updated);
  };

  const resetBuilder = () => {
    setCustomerName(''); setMobile(''); setBusiness(''); setAddress(''); setGstin('');
    setEstimateDate(new Date().toISOString().slice(0, 10));
    setValidUntil(new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));
    setTaxRate(profile.defaultGstRate || 18); setDiscount(0); setNotes('');
    setItems([{ productId: '', description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }]);
  };

  const saveEstimate = () => {
    if (!customerName.trim() || !mobile.trim() || subtotal <= 0 || items.some((item) => !item.description.trim() || item.quantity <= 0)) {
      alert('Customer name, mobile and at least one complete item are required.');
      return;
    }
    const estimate: Estimate = {
      id: 'est-' + Date.now(),
      estimateNo: 'PCT-EST-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-5),
      estimateDate,
      validUntil,
      customerName: customerName.trim(),
      customerMobile: mobile.trim(),
      customerBusiness: business.trim() || undefined,
      customerAddress: address.trim() || 'Ahmedabad',
      customerGstin: gstin.trim() || undefined,
      items,
      subtotal,
      taxRate: Number(taxRate),
      taxAmount,
      discount: Number(discount),
      totalAmount: total,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    onSaveEstimate(estimate);
    setBuilderOpen(false);
    resetBuilder();
  };

  const printEstimate = (estimate: Estimate) => {
    const popup = window.open('', '_blank', 'width=900,height=750');
    if (!popup) { alert('Please allow pop-ups to print the estimate.'); return; }
    const rows = estimate.items.map((item, index) => '<tr><td>' + (index + 1) + '</td><td>' + escapeHtml(item.description) + '</td><td>' + item.quantity + '</td><td>' + money(item.unitPrice) + '</td><td>' + money(item.lineTotal) + '</td></tr>').join('');
    popup.document.write('<!doctype html><html><head><title>' + escapeHtml(estimate.estimateNo) + '</title><style>body{font:14px Arial;color:#111;padding:28px}h1{margin:0;color:#087f5b}small{color:#555}.top{display:flex;justify-content:space-between;border-bottom:2px solid #087f5b;padding-bottom:15px}table{width:100%;border-collapse:collapse;margin-top:25px}th,td{border:1px solid #bbb;padding:9px;text-align:left}th{background:#eee}.totals{margin:20px 0 0 auto;width:300px}.totals div{display:flex;justify-content:space-between;padding:5px}.grand{font-size:18px;font-weight:bold;border-top:2px solid #087f5b}.terms{margin-top:35px;border-top:1px solid #aaa;padding-top:12px}</style></head><body>');
    popup.document.write('<div class="top"><div><h1>' + escapeHtml(profile.name) + '</h1><p>' + escapeHtml(profile.tagline || '') + '</p><p>' + escapeHtml(profile.address || '') + ', ' + escapeHtml(profile.location || '') + '</p><p>Mobile: ' + escapeHtml(profile.mobile || '') + ' | Email: ' + escapeHtml(profile.email || '') + '</p><p>GSTIN: ' + escapeHtml(profile.gstin || '') + '</p></div><div><h2>ESTIMATE / QUOTATION</h2><b>' + escapeHtml(estimate.estimateNo) + '</b><p>Date: ' + estimate.estimateDate + '</p><p>Valid Until: ' + estimate.validUntil + '</p></div></div>');
    popup.document.write('<h3>Bill To</h3><p><b>' + escapeHtml(estimate.customerName) + '</b><br>' + escapeHtml(estimate.customerBusiness || '') + '<br>' + escapeHtml(estimate.customerAddress) + '<br>Mobile: ' + escapeHtml(estimate.customerMobile) + '<br>GSTIN: ' + escapeHtml(estimate.customerGstin || '-') + '</p>');
    popup.document.write('<table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>' + rows + '</tbody></table>');
    popup.document.write('<div class="totals"><div><span>Taxable Subtotal</span><b>' + money(estimate.subtotal) + '</b></div><div><span>GST (' + estimate.taxRate + '%)</span><b>' + money(estimate.taxAmount) + '</b></div><div><span>Discount</span><b>' + money(estimate.discount) + '</b></div><div class="grand"><span>Grand Total</span><b>' + money(estimate.totalAmount) + '</b></div></div>');
    popup.document.write('<p><b>Notes:</b> ' + escapeHtml(estimate.notes || '-') + '</p><div class="terms"><b>Terms & Conditions</b><p>' + escapeHtml(profile.terms || '') + '</p><p>Thank you for your enquiry.</p></div><script>window.onload=function(){window.print();};<\/script></body></html>');
    popup.document.close();
  };

  const partyRows = useMemo(() => {
    const groups = new Map<string, { name: string; mobile: string; invoices: Invoice[]; sales: number; cost: number; discount: number }>();
    invoices.forEach((invoice) => {
      const key = (invoice.customerMobile || invoice.customerName).toLowerCase();
      const row = groups.get(key) || { name: invoice.customerName, mobile: invoice.customerMobile, invoices: [], sales: 0, cost: 0, discount: 0 };
      row.invoices.push(invoice);
      row.sales += invoice.subtotal || 0;
      row.discount += invoice.discount || 0;
      invoice.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) row.cost += (product.purchasePrice || 0) * (Number(item.quantity) || 0);
      });
      groups.set(key, row);
    });
    return Array.from(groups.values()).map((row) => ({ ...row, profit: row.sales - row.discount - row.cost })).sort((x, y) => y.profit - x.profit);
  }, [invoices, products]);

  const filtered = partyRows.filter((row) => (row.name + ' ' + row.mobile).toLowerCase().includes(search.toLowerCase()));
  const totalSales = partyRows.reduce((sum, row) => sum + row.sales - row.discount, 0);
  const totalCost = partyRows.reduce((sum, row) => sum + row.cost, 0);
  const totalProfit = totalSales - totalCost;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400"><TrendingUp className="w-6 h-6" /></div><div><h1 className="text-xl font-bold">Estimated Profit & Quotation</h1><p className="text-xs text-gray-400">Create customer estimates and review party-wise profit</p></div></div>
        <button onClick={() => { resetBuilder(); setBuilderOpen(true); }} className="bg-emerald-600 hover:bg-emerald-500 rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Create New Estimate</button>
      </div>

      {builderOpen && <section className="bg-gray-900 border border-emerald-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between"><h2 className="font-bold text-emerald-400">Create Estimate / Quotation</h2><button onClick={() => setBuilderOpen(false)} className="text-gray-400">Close</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input list="estimate-customers" value={customerName} onChange={(e) => { setCustomerName(e.target.value); const c = customers.find((x) => x.name.toLowerCase() === e.target.value.toLowerCase()); if (c) { setMobile(c.mobile); setBusiness(c.businessName || ''); setAddress(c.address || ''); setGstin(c.gstin || ''); } }} placeholder="Customer / Firm Name *" className="bg-gray-950 border border-gray-700 rounded-lg p-2 text-sm" />
          <datalist id="estimate-customers">{customers.map((c) => <option key={c.id} value={c.name} />)}</datalist>
          <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Customer Mobile *" className="bg-gray-950 border border-gray-700 rounded-lg p-2 text-sm" />
          <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Firm Name (optional)" className="bg-gray-950 border border-gray-700 rounded-lg p-2 text-sm" />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="bg-gray-950 border border-gray-700 rounded-lg p-2 text-sm" />
          <input value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="Customer GSTIN" className="bg-gray-950 border border-gray-700 rounded-lg p-2 text-sm" />
          <label className="text-xs text-gray-300">Estimate Date<input type="date" value={estimateDate} onChange={(e) => setEstimateDate(e.target.value)} className="block w-full bg-gray-950 border border-gray-700 rounded-lg p-2 mt-1" /></label>
          <label className="text-xs text-gray-300">Valid Until<input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="block w-full bg-gray-950 border border-gray-700 rounded-lg p-2 mt-1" /></label>
        </div>
        <div className="flex items-center justify-between"><h3 className="font-semibold">Items</h3><button onClick={() => setItems([...items, { productId: '', description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }])} className="text-blue-400 text-sm">+ Add Item</button></div>
        {items.map((item, index) => <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-gray-950 p-3 rounded-lg">
          <select value={item.productId || ''} onChange={(e) => selectProduct(index, e.target.value)} className="md:col-span-4 bg-gray-900 border border-gray-700 rounded p-2 text-sm"><option value="">Select stock item (optional)</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} — Stock {p.stockQuantity}</option>)}</select>
          <input value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder="Description / Service" className="md:col-span-3 bg-gray-900 border border-gray-700 rounded p-2 text-sm" />
          <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))} placeholder="Qty" className="md:col-span-1 bg-gray-900 border border-gray-700 rounded p-2 text-sm" />
          <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))} placeholder="Rate before GST" className="md:col-span-2 bg-gray-900 border border-gray-700 rounded p-2 text-sm" />
          <div className="md:col-span-1 flex items-center text-sm font-semibold">{money(item.lineTotal)}</div>
          <button onClick={() => setItems(items.length > 1 ? items.filter((_, i) => i !== index) : items)} className="text-rose-400 flex justify-center"><Trash2 className="w-4 h-4" /></button>
        </div>)}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-xs text-gray-300">GST Rate (%)<input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="block w-full bg-gray-950 border border-gray-700 rounded-lg p-2 mt-1" /></label>
          <label className="text-xs text-gray-300">Discount (₹)<input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="block w-full bg-gray-950 border border-gray-700 rounded-lg p-2 mt-1" /></label>
          <label className="text-xs text-gray-300">Notes<input value={notes} onChange={(e) => setNotes(e.target.value)} className="block w-full bg-gray-950 border border-gray-700 rounded-lg p-2 mt-1" /></label>
        </div>
        <div className="bg-gray-950 rounded-lg p-4 space-y-1 text-sm">
          <div className="flex justify-between"><span>Taxable Subtotal</span><b>{money(subtotal)}</b></div><div className="flex justify-between"><span>GST ({taxRate}%)</span><b>{money(taxAmount)}</b></div><div className="flex justify-between"><span>Discount</span><b>{money(discount)}</b></div><div className="flex justify-between text-lg text-emerald-400 font-bold border-t border-gray-700 pt-2"><span>Quotation Total</span><span>{money(total)}</span></div><div className="flex justify-between text-emerald-300"><span>Internal Estimated Profit (not printed)</span><b>{money(estimatedProfit)}</b></div>
        </div>
        <div className="flex flex-wrap gap-2"><button onClick={saveEstimate} className="bg-emerald-600 hover:bg-emerald-500 rounded-lg px-5 py-2 font-bold">Save Estimate</button><span className="text-xs text-gray-400 self-center">Estimate save karne se stock, invoice aur accounts change nahi honge.</span></div>
      </section>}

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="font-bold">Saved Estimates / Quotations</h2>
        {estimates.length === 0 ? <p className="text-sm text-gray-400">No estimates created yet.</p> : estimates.map((estimate) => <div key={estimate.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 pt-3"><div><b className="text-sm">{estimate.estimateNo}</b><p className="text-xs text-gray-400">{estimate.customerName} · {estimate.customerMobile} · {estimate.estimateDate}</p></div><div className="flex items-center gap-3"><b className="text-emerald-400">{money(estimate.totalAmount)}</b><button onClick={() => printEstimate(estimate)} className="text-blue-400 text-sm flex items-center gap-1"><Printer className="w-4 h-4" /> Print / PDF</button></div></div>)}
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4"><p className="text-xs text-gray-400">Invoice Sales (before GST)</p><p className="text-xl font-bold">{money(totalSales)}</p></div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4"><p className="text-xs text-gray-400">Purchase Cost</p><p className="text-xl font-bold">{money(totalCost)}</p></div>
        <div className="bg-gray-900 border border-emerald-800 rounded-xl p-4"><p className="text-xs text-emerald-400">Estimated Profit</p><p className="text-xl font-bold text-emerald-400">{money(totalProfit)}</p></div>
      </div>
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2"><Search className="w-4 h-4 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer / mobile number..." className="bg-transparent outline-none w-full text-sm text-white" /></div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-800"><span className="col-span-4">Party / Customer</span><span className="col-span-2 text-right">Invoices</span><span className="col-span-2 text-right">Sale</span><span className="col-span-2 text-right">Cost</span><span className="col-span-2 text-right">Profit</span></div>
        {filtered.length === 0 ? <p className="p-6 text-center text-sm text-gray-400">No invoice / party data found yet.</p> : filtered.map((row) => {
          const key = (row.mobile || row.name).toLowerCase();
          const open = expandedParty === key;
          return <div key={key} className="border-b border-gray-800 last:border-0"><button onClick={() => setExpandedParty(open ? null : key)} className="w-full grid grid-cols-12 gap-2 px-4 py-3 text-left items-center hover:bg-gray-800/60"><span className="col-span-4 min-w-0"><span className="block text-sm font-semibold truncate">{row.name}</span><span className="block text-[10px] text-gray-400">{row.mobile}</span></span><span className="col-span-2 text-right text-sm">{row.invoices.length}</span><span className="col-span-2 text-right text-xs">{money(row.sales - row.discount)}</span><span className="col-span-2 text-right text-xs">{money(row.cost)}</span><span className="col-span-2 text-right text-xs font-bold text-emerald-400">{money(row.profit)} {open ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />}</span></button>
            {open && <div className="px-4 pb-3 space-y-2 bg-gray-950/60">{row.invoices.map((inv) => { const invCost = inv.items.reduce((sum, item) => { const p = products.find((x) => x.id === item.productId); return sum + (p ? p.purchasePrice * item.quantity : 0); }, 0); return <div key={inv.id} className="flex justify-between gap-2 border-t border-gray-800 pt-2 text-xs"><span>{inv.invoiceNo} · {inv.invoiceDate}</span><b>Profit {money(inv.subtotal - inv.discount - invCost)}</b></div>; })}</div>}
          </div>;
        })}
      </div>
      <p className="text-[10px] text-gray-500">Profit estimate uses current saved purchase prices; GST excluded and discounts deducted. Estimates are separate from tax invoices and do not affect inventory or accounts.</p>
    </div>
  );
};
