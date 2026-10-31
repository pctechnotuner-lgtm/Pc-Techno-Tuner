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
  const [editingEstimateId, setEditingEstimateId] = useState<string | null>(null);
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
    setEditingEstimateId(null);
    setCustomerName(''); setMobile(''); setBusiness(''); setAddress(''); setGstin('');
    setEstimateDate(new Date().toISOString().slice(0, 10));
    setValidUntil(new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));
    setTaxRate(profile.defaultGstRate || 18); setDiscount(0); setNotes('');
    setItems([{ productId: '', description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }]);
  };

  const editEstimate = (estimate: Estimate) => {
    setEditingEstimateId(estimate.id);
    setCustomerName(estimate.customerName || '');
    setMobile(estimate.customerMobile || '');
    setBusiness(estimate.customerBusiness || '');
    setAddress(estimate.customerAddress || '');
    setGstin(estimate.customerGstin || '');
    setEstimateDate(estimate.estimateDate);
    setValidUntil(estimate.validUntil);
    setTaxRate(estimate.taxRate);
    setDiscount(estimate.discount || 0);
    setNotes(estimate.notes || '');
    setItems(estimate.items.map((item) => ({ ...item })));
    setBuilderOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveEstimate = () => {
    if (!customerName.trim() || !mobile.trim() || subtotal <= 0 || items.some((item) => !item.description.trim() || item.quantity <= 0)) {
      alert('Customer name, mobile and at least one complete item are required.');
      return;
    }
    const estimate: Estimate = {
      id: editingEstimateId || 'est-' + Date.now(),
      estimateNo: (editingEstimateId ? estimates.find((item) => item.id === editingEstimateId)?.estimateNo : undefined) || 'PCT-EST-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-5),
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
    const popup = window.open('', '_blank', 'width=1000,height=900');
    if (!popup) { alert('Please allow pop-ups to print the estimate.'); return; }
    const dateText = (value: string) => value ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB') : '';
    const gst = Number(estimate.taxAmount || 0);
    const halfTax = gst / 2;
    const amountWords = (amount: number) => {
      const n = Math.round(amount);
      if (!n) return 'Zero Rupees Only';
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const underThousand = (v: number): string => {
        let out = '';
        if (v >= 100) out += ones[Math.floor(v / 100)] + ' Hundred ';
        v %= 100;
        if (v >= 20) out += tens[Math.floor(v / 10)] + (v % 10 ? ' ' + ones[v % 10] : '');
        else if (v > 0) out += ones[v];
        return out.trim();
      };
      let v = n;
      const parts: string[] = [];
      const crore = Math.floor(v / 10000000); v %= 10000000;
      const lakh = Math.floor(v / 100000); v %= 100000;
      const thousand = Math.floor(v / 1000); v %= 1000;
      if (crore) parts.push(underThousand(crore) + ' Crore');
      if (lakh) parts.push(underThousand(lakh) + ' Lakh');
      if (thousand) parts.push(underThousand(thousand) + ' Thousand');
      if (v) parts.push(underThousand(v));
      return parts.join(' ') + ' Rupees Only';
    };
    const rows = estimate.items.map((item, index) => {
      const lineTax = Number(item.lineTotal || 0) * Number(estimate.taxRate || 0) / 100;
      return '<tr><td>' + (index + 1) + '</td><td class="item-name">' + escapeHtml(item.description) + (item.category ? '<small>' + escapeHtml(item.category) + '</small>' : '') + '</td><td>' + item.quantity + ' PCS</td><td>' + money(item.unitPrice) + '</td><td>' + money(lineTax) + '<small>(' + estimate.taxRate + '%)</small></td><td>' + money(Number(item.lineTotal || 0) + lineTax) + '</td></tr>';
    }).join('');
    const emptyRows = Array.from({ length: Math.max(0, 5 - estimate.items.length) }).map(() => '<tr class="empty"><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>').join('');
    const companyAddress = [profile.address, profile.location, profile.pincode].filter(Boolean).join(', ');
    const terms = profile.terms || '1. Goods once sold will not be taken back.\n2. Warranty as per terms & condition of the manufacturer & distributor.\n3. Subject to Ahmedabad Jurisdiction Only.';
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>' + escapeHtml(estimate.estimateNo) + '</title><style>' +
      '@page{size:A4 portrait;margin:9mm}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;color:#111;background:#fff;font:10.5px/1.35 Arial,Helvetica,sans-serif}.sheet{width:100%;max-width:192mm;min-height:278mm;margin:0 auto;display:flex;flex-direction:column}.caption{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;font-size:12px}.caption span{border:1px solid #888;padding:4px 7px;color:#333;font-size:9px}.header{display:grid;grid-template-columns:1fr 1fr;border:1px solid #222;min-height:36mm}.company{display:flex;align-items:center;gap:10px;padding:10px;border-right:1px solid #222;min-width:0}.logo{width:23mm;height:23mm;object-fit:contain;flex:none}.company h1{font-size:17px;font-weight:800;margin:0 0 5px}.company p{margin:3px 0;overflow-wrap:anywhere}.meta{display:grid;grid-template-columns:repeat(3,1fr);align-items:center;text-align:center}.meta div{padding:7px 4px}.meta b,.meta span{display:block}.meta b{margin-bottom:7px}.parties{display:grid;grid-template-columns:1fr 1fr;border:1px solid #222;border-top:0}.parties section{padding:10px;min-height:34mm}.parties section+section{border-left:1px solid #222}.parties h3,.bottom h3,.footer h3{font-size:11px;font-weight:800;margin:0 0 6px}.parties p{margin:4px 0;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse;table-layout:fixed}.items th,.items td,.gst th,.gst td{border:1px solid #222;padding:7px 5px}.items th,.gst th{background:#e5e5e5;font-weight:800;text-align:center}.items th:nth-child(1){width:11%}.items th:nth-child(2){width:39%}.items th:nth-child(3){width:11%}.items th:nth-child(4){width:13%}.items th:nth-child(5){width:13%}.items th:nth-child(6){width:13%}.items td:not(:nth-child(2)){text-align:right}.items td:first-child,.items td:nth-child(3){text-align:center}.item-name{overflow-wrap:anywhere}.item-name small,.items td small{display:block;color:#555;font-size:9px}.items tr.empty td{height:18mm}.items tfoot td{background:#e5e5e5;font-weight:800}.total-label{text-align:right!important}.gst{margin-top:3mm;font-size:9.5px}.gst th,.gst td{text-align:center;padding:6px 4px}.words{border:1px solid #222;border-top:0;padding:9px}.words b,.words span{display:block}.words span{margin-top:5px}.bottom{display:grid;grid-template-columns:1fr 1fr;border:1px solid #222;border-top:0;min-height:34mm}.bottom section{padding:10px}.bottom section+section{border-left:1px solid #222}.bottom p{margin:4px 0}.qr p{margin:5px 0}.footer{display:grid;grid-template-columns:1fr 1fr;border:1px solid #222;border-top:0;min-height:30mm;margin-top:auto}.footer section{padding:10px}.footer section+section{border-left:1px solid #222}.footer p{white-space:pre-line;margin:0}.sign{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;text-align:center;gap:3px}.sign strong{font-weight:800}@media print{body{width:100%;min-height:280mm}.sheet{min-height:278mm}}' +
      '</style></head><body><main class="sheet">' +
      '<div class="caption"><strong>ESTIMATE / QUOTATION</strong><span>NOT A TAX INVOICE</span></div>' +
      '<div class="header"><div class="company">' + (profile.logoUrl ? '<img class="logo" src="' + escapeHtml(profile.logoUrl) + '" alt="Logo">' : '') + '<div><h1>' + escapeHtml(profile.name || 'PC TECHNO TUNER') + '</h1><p>' + escapeHtml(companyAddress) + '</p><p><b>GSTIN:</b> ' + escapeHtml(profile.gstin || '-') + ' <b style="margin-left:12px">Mobile:</b> ' + escapeHtml(profile.mobile || '-') + '</p><p><b>PAN Number:</b> ' + escapeHtml(profile.pan || '-') + '</p><p><b>Email:</b> ' + escapeHtml(profile.email || '-') + '</p><p><b>Website:</b> www.pctechnotuner.com</p></div></div>' +
      '<div class="meta"><div><b>Estimate No.</b><span>' + escapeHtml(estimate.estimateNo) + '</span></div><div><b>Estimate Date</b><span>' + dateText(estimate.estimateDate) + '</span></div><div><b>Valid Until</b><span>' + dateText(estimate.validUntil) + '</span></div></div></div>' +
      '<div class="parties"><section><h3>BILL TO</h3><b>' + escapeHtml(estimate.customerBusiness || estimate.customerName) + '</b>' + (estimate.customerBusiness ? '<p>' + escapeHtml(estimate.customerName) + '</p>' : '') + '<p><b>Address:</b> ' + escapeHtml(estimate.customerAddress || '-') + '</p><p><b>GSTIN:</b> ' + escapeHtml(estimate.customerGstin || '-') + '</p><p><b>Mobile:</b> ' + escapeHtml(estimate.customerMobile || '-') + '</p></section><section><h3>SHIP TO</h3><b>' + escapeHtml(estimate.customerBusiness || estimate.customerName) + '</b>' + (estimate.customerBusiness ? '<p>' + escapeHtml(estimate.customerName) + '</p>' : '') + '<p><b>Address:</b> ' + escapeHtml(estimate.customerAddress || '-') + '</p><p><b>Place of Supply:</b> Gujarat</p></section></div>' +
      '<table class="items"><thead><tr><th>S.NO.</th><th>ITEMS</th><th>QTY.</th><th>RATE</th><th>TAX</th><th>AMOUNT</th></tr></thead><tbody>' + rows + emptyRows + '</tbody><tfoot><tr><td colspan="2" class="total-label">TOTAL</td><td>' + estimate.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) + '</td><td></td><td>' + money(gst) + '</td><td>' + money(estimate.totalAmount) + '</td></tr><tr><td colspan="5" class="total-label">QUOTATION AMOUNT</td><td>' + money(estimate.totalAmount) + '</td></tr></tfoot></table>' +
      '<table class="gst"><thead><tr><th rowspan="2">HSN/SAC</th><th rowspan="2">Taxable Value</th><th colspan="2">CGST</th><th colspan="2">SGST</th><th rowspan="2">Total Tax Amount</th></tr><tr><th>Rate</th><th>Amount</th><th>Rate</th><th>Amount</th></tr></thead><tbody><tr><td>-</td><td>' + money(estimate.subtotal) + '</td><td>' + (Number(estimate.taxRate || 0) / 2) + '%</td><td>' + money(halfTax) + '</td><td>' + (Number(estimate.taxRate || 0) / 2) + '%</td><td>' + money(halfTax) + '</td><td>' + money(gst) + '</td></tr></tbody></table>' +
      '<div class="words"><b>Total Amount (in words)</b><span>' + amountWords(estimate.totalAmount) + '</span></div>' +
      '<div class="bottom"><section><h3>Bank Details</h3><p><b>Name:</b> ' + escapeHtml(profile.name || 'PC TECHNO TUNER') + '</p><p><b>IFSC Code:</b> ' + escapeHtml(profile.ifscCode || '-') + '</p><p><b>Account No:</b> ' + escapeHtml(profile.accountNumber || '-') + '</p><p><b>Bank:</b> ' + escapeHtml(profile.bankName || '-') + '</p><p><b>UPI ID:</b> ' + escapeHtml(profile.upiId || '-') + '</p></section><section class="qr"><h3>Payment Details</h3><p>Scan and pay using UPI app</p><b>' + escapeHtml(profile.upiId || 'UPI ID not configured') + '</b><p><b>Note:</b> Payment is due only after order confirmation.</p></section></div>' +
      '<div class="footer"><section><h3>Terms and Conditions</h3><p>' + escapeHtml(terms) + '</p></section><section class="sign"><b>Authorised Signatory For</b><strong>' + escapeHtml(profile.name || 'PC TECHNO TUNER') + '</strong></section></div>' +
      '</main><script>window.onload=function(){window.print();};<\/script></body></html>';
    popup.document.open();
    popup.document.write(html);
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
        <div className="flex items-center justify-between"><h2 className="font-bold text-emerald-400">{editingEstimateId ? 'Edit Estimate / Quotation' : 'Create Estimate / Quotation'}</h2><button onClick={() => setBuilderOpen(false)} className="text-gray-400">Close</button></div>
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
        <div className="flex flex-wrap gap-2"><button onClick={saveEstimate} className="bg-emerald-600 hover:bg-emerald-500 rounded-lg px-5 py-2 font-bold"{editingEstimateId ? 'Update Estimate' : 'Save Estimate'}</button><span className="text-xs text-gray-400 self-center">Estimate save karne se stock, invoice aur accounts change nahi honge.</span></div>
      </section>}

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="font-bold">Saved Estimates / Quotations</h2>
        {estimates.length === 0 ? <p className="text-sm text-gray-400">No estimates created yet.</p> : estimates.map((estimate) => <div key={estimate.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 pt-3"><div><b className="text-sm">{estimate.estimateNo}</b><p className="text-xs text-gray-400">{estimate.customerName} · {estimate.customerMobile} · {estimate.estimateDate}</p></div><div className="flex items-center gap-3"><b className="text-emerald-400">{money(estimate.totalAmount)}</b><button onClick={() => editEstimate(estimate)} className="text-amber-300 text-sm font-semibold">Edit</button><button onClick={() => printEstimate(estimate)} className="text-blue-400 text-sm flex items-center gap-1"><Printer className="w-4 h-4" /> Print / PDF</button></div></div>)}
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
