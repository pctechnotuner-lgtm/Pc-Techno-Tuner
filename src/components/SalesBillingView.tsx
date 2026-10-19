import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Printer,
  MessageCircle,
  Download,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  DollarSign,
  PlusCircle,
  Trash2,
  Share2,
} from 'lucide-react';
import {
  CompanyProfile,
  Customer,
  Invoice,
  InvoiceItem,
  Language,
  PaymentMethod,
  PaymentStatus,
  Product,
} from '../types';
import { getT } from '../i18n';

interface SalesBillingViewProps {
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];
  profile: CompanyProfile;
  lang: Language;
  onSaveInvoice: (invoice: Invoice) => void;
  onExportCsv: () => void;
  activeInvoiceForModal?: Invoice | null;
}

export const SalesBillingView: React.FC<SalesBillingViewProps> = ({
  invoices,
  products,
  customers,
  profile,
  lang,
  onSaveInvoice,
  onExportCsv,
}) => {
  const t = getT(lang);
  const [search, setSearch] = useState('');
  const [printInvoiceData, setPrintInvoiceData] = useState<Invoice | null>(null);

  // New Invoice Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custBusiness, setCustBusiness] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custGstin, setCustGstin] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [taxRate, setTaxRate] = useState<number>(profile.defaultGstRate || 18);
  const [discount, setDiscount] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');

  // Line Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { productId: '', description: '', quantity: 1, unitPrice: 0, lineTotal: 0 },
  ]);

  const handleOpenCreateModal = () => {
    setCustName('');
    setCustMobile('');
    setCustBusiness('');
    setCustAddress('');
    setCustGstin('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setTaxRate(profile.defaultGstRate || 18);
    setDiscount(0);
    setAmountPaid(0);
    setPaymentMethod('UPI');
    setNotes('');
    setItems([{ productId: '', description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }]);
    setCreateModalOpen(true);
  };

  const handleSelectCustomer = (cName: string) => {
    setCustName(cName);
    const existing = customers.find((c) => c.name.toLowerCase() === cName.toLowerCase());
    if (existing) {
      setCustMobile(existing.mobile);
      setCustBusiness(existing.businessName || '');
      setCustAddress(existing.address || '');
      setCustGstin(existing.gstin || '');
    }
  };

  const handleProductSelect = (index: number, productId: string) => {
    const selected = products.find((p) => p.id === productId);
    const updated = [...items];
    if (selected) {
      // Selling price in product catalog includes GST.
      // Let's compute the base price before tax for standard tax invoice:
      const basePrice = Math.round((selected.sellingPrice / (1 + taxRate / 100)) * 100) / 100;
      updated[index] = {
        productId: selected.id,
        description: `${selected.name} (${selected.brand} ${selected.model})`,
        category: selected.category,
        quantity: updated[index].quantity || 1,
        unitPrice: basePrice,
        lineTotal: Math.round(basePrice * (updated[index].quantity || 1) * 100) / 100,
      };
    } else {
      updated[index].productId = '';
    }
    setItems(updated);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, val: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = val;
    if (field === 'quantity' || field === 'unitPrice') {
      const q = Number(updated[index].quantity) || 0;
      const u = Number(updated[index].unitPrice) || 0;
      updated[index].lineTotal = Math.round(q * u * 100) / 100;
    }
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { productId: '', description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);
  const taxAmount = Math.round(((subtotal * Number(taxRate)) / 100) * 100) / 100;
  const grandTotal = Math.max(0, Math.round((subtotal + taxAmount - Number(discount)) * 100) / 100);
  const balanceDue = Math.max(0, Math.round((grandTotal - Number(amountPaid)) * 100) / 100);

  const paymentStatus: PaymentStatus =
    balanceDue <= 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Unpaid';

  const handleSaveInvoiceForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custMobile.trim() || items.length === 0 || subtotal <= 0) {
      alert('Please fill in customer details and at least one billable item.');
      return;
    }

    const invoiceNo = `PCT-INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNo,
      invoiceDate,
      customerName: custName.trim(),
      customerMobile: custMobile.trim(),
      customerBusiness: custBusiness.trim() || undefined,
      customerAddress: custAddress.trim() || 'Ahmedabad',
      customerGstin: custGstin.trim() || undefined,
      items,
      subtotal,
      taxRate: Number(taxRate),
      taxAmount,
      discount: Number(discount) || 0,
      totalAmount: grandTotal,
      amountPaid: Number(amountPaid) || 0,
      balanceDue,
      paymentStatus,
      paymentMethod,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveInvoice(newInvoice);
    setCreateModalOpen(false);
  };

  const handleShareInvoiceWhatsApp = (inv: Invoice) => {
    const text = `PC TECHNO TUNER — TAX INVOICE
Invoice No: ${inv.invoiceNo}
Date: ${inv.invoiceDate}
Customer: ${inv.customerName}
Total Amount: ₹${inv.totalAmount.toLocaleString('en-IN')}
Amount Paid: ₹${inv.amountPaid.toLocaleString('en-IN')}
Balance Due: ₹${inv.balanceDue.toLocaleString('en-IN')}
Payment Status: ${inv.paymentStatus}

Thank you for choosing PC TECHNO TUNER, Ahmedabad!
For support call: 7383871195`;

    window.open(`https://wa.me/91${inv.customerMobile}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleTriggerPrint = (inv: Invoice) => {
    setPrintInvoiceData(inv);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      inv.invoiceNo.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      inv.customerMobile.includes(q) ||
      (inv.customerBusiness && inv.customerBusiness.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-500" />
            <span>Sales & GST Tax Billing</span>
          </h1>
          <p className="text-xs text-gray-400">
            Generate GST-compliant tax invoices, deduct stock automatically, print, and WhatsApp bills.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New GST Bill</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice #, customer name, mobile..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950 text-gray-400 uppercase font-bold border-b border-gray-800 tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-400">{inv.invoiceNo}</td>
                  <td className="py-3 px-4 text-gray-400">{inv.invoiceDate}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-white text-xs">{inv.customerName}</p>
                    <p className="text-[10px] text-emerald-400 font-mono">{inv.customerMobile}</p>
                    {inv.customerBusiness && (
                      <p className="text-[10px] text-gray-400">{inv.customerBusiness}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    ₹{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    ₹{inv.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    {inv.balanceDue > 0 ? (
                      <span className="text-rose-400">
                        ₹{inv.balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-gray-500">Nil</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.paymentStatus === 'Paid'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : inv.paymentStatus === 'Partial'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleTriggerPrint(inv)}
                      className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-xs inline-flex items-center gap-1 transition"
                      title="Print A4 GST invoice"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-400" />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={() => handleShareInvoiceWhatsApp(inv)}
                      className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 rounded text-xs inline-flex items-center gap-1 transition"
                      title="Share bill details on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create GST Invoice Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 my-8 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Create GST Sales Tax Invoice</span>
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoiceForm} className="space-y-4 text-xs">
              {/* Customer Details */}
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">1. Customer Information</span>
                  {customers.length > 0 && (
                    <select
                      onChange={(e) => handleSelectCustomer(e.target.value)}
                      className="bg-gray-900 border border-gray-700 text-gray-300 rounded px-2 py-1 text-[11px]"
                    >
                      <option value="">-- Choose Existing Customer --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.mobile})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Customer / Firm Name *</label>
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Customer Mobile *</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      value={custMobile}
                      onChange={(e) => setCustMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="10 digit mobile number"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Firm Name (Optional)</label>
                    <input
                      type="text"
                      value={custBusiness}
                      onChange={(e) => setCustBusiness(e.target.value)}
                      placeholder="Enterprise"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Ahmedabad Address</label>
                    <input
                      type="text"
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      placeholder="Area, Ahmedabad"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Customer GSTIN</label>
                    <input
                      type="text"
                      value={custGstin}
                      onChange={(e) => setCustGstin(e.target.value.toUpperCase())}
                      placeholder="24AAAA..."
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white uppercase font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">2. Hardware Line Items</span>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-950 rounded-xl border border-gray-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                    >
                      <div className="sm:col-span-5">
                        <select
                          value={item.productId || ''}
                          onChange={(e) => handleProductSelect(idx, e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-white text-xs"
                        >
                          <option value="">-- Choose Hardware Stock --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stock: {p.stockQuantity}) - ₹{p.sellingPrice}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-white text-xs text-center"
                          title="Quantity"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                          placeholder="Unit Base"
                          className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-white text-xs font-mono"
                          title="Base Unit Price (Before Tax)"
                        />
                      </div>

                      <div className="sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Taxes & Settlement */}
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">GST Tax Rate (%)</label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-white"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% (IT Hardware Spec)</option>
                    <option value={12}>12% (Telecom / Hardware)</option>
                    <option value={18}>18% (Standard GST)</option>
                    <option value={28}>28% (Luxury / High end)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Discount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-white"
                  >
                    <option value="UPI">UPI / GPay / Paytm</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Card">Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between gap-6 text-gray-400">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono text-white">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-6 text-gray-400">
                    <span>GST ({taxRate}%):</span>
                    <span className="font-mono text-white">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-6 text-gray-400">
                    <span>Discount:</span>
                    <span className="font-mono text-rose-400">-₹{Number(discount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-6 font-bold text-sm text-white pt-1 border-t border-gray-800">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-400">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="w-full sm:w-56 space-y-2 bg-gray-950 p-3 rounded-lg border border-gray-800 text-xs">
                  <label className="block text-gray-300 font-semibold">Amount Paid Today (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-white font-mono font-bold"
                  />
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-gray-400">Balance Due:</span>
                    <span className={`font-mono font-black ${balanceDue > 0 ? 'text-rose-400' : 'text-gray-500'}`}>
                      ₹{balanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save and Issue GST Invoice</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Overlay (Rendered into DOM for clean Ctrl+P / window.print) */}
      {printInvoiceData && (
        <div className="print-only hidden p-8 bg-white text-black font-sans">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-black text-blue-700 tracking-tight">{profile.name}</h1>
              <p className="text-xs text-gray-700">{profile.address}, {profile.location} — {profile.pincode}</p>
              <p className="text-xs text-gray-700">Mobile/WhatsApp: {profile.mobile} | Email: {profile.email}</p>
              <p className="text-xs font-bold mt-1">GSTIN: {profile.gstin} | PAN: {profile.pan}</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold bg-gray-100 px-3 py-1 border border-gray-300">TAX INVOICE</span>
              <p className="text-xs font-mono font-bold mt-2">Invoice #: {printInvoiceData.invoiceNo}</p>
              <p className="text-xs text-gray-600">Date: {printInvoiceData.invoiceDate}</p>
            </div>
          </div>

          {/* Customer / Billed To */}
          <div className="grid grid-cols-2 gap-4 border border-gray-300 p-3 rounded mb-4 text-xs">
            <div>
              <p className="text-gray-500 font-bold uppercase text-[10px]">Billed To Customer</p>
              <p className="text-sm font-bold text-black">{printInvoiceData.customerName}</p>
              {printInvoiceData.customerBusiness && (
                <p className="font-semibold">{printInvoiceData.customerBusiness}</p>
              )}
              <p>{printInvoiceData.customerAddress}</p>
              <p className="font-mono mt-1">Mobile: {printInvoiceData.customerMobile}</p>
            </div>
            <div className="text-right">
              {printInvoiceData.customerGstin && (
                <p className="font-mono font-bold">Customer GSTIN: {printInvoiceData.customerGstin}</p>
              )}
              <p className="text-gray-600 mt-2">Payment Method: {printInvoiceData.paymentMethod}</p>
              <p className="font-semibold text-emerald-700">Status: {printInvoiceData.paymentStatus}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs border-collapse border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-gray-800">
                <th className="p-2 border-r border-gray-300">#</th>
                <th className="p-2 border-r border-gray-300">Product / Service Description</th>
                <th className="p-2 border-r border-gray-300 text-center">Qty</th>
                <th className="p-2 border-r border-gray-300 text-right">Unit Rate (₹)</th>
                <th className="p-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {printInvoiceData.items.map((it, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="p-2 border-r border-gray-300 text-center">{idx + 1}</td>
                  <td className="p-2 border-r border-gray-300">
                    <p className="font-bold">{it.description}</p>
                    {it.category && <p className="text-[10px] text-gray-500">{it.category}</p>}
                  </td>
                  <td className="p-2 border-r border-gray-300 text-center font-bold">{it.quantity}</td>
                  <td className="p-2 border-r border-gray-300 text-right font-mono">
                    ₹{Number(it.unitPrice).toFixed(2)}
                  </td>
                  <td className="p-2 text-right font-mono font-bold">
                    ₹{Number(it.lineTotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Bank Section */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6">
            <div className="border border-gray-300 p-3 rounded">
              <p className="font-bold uppercase text-[10px] text-gray-600 mb-1">Bank Payment Details</p>
              <p>Bank: <strong>{profile.bankName}</strong></p>
              <p>Account No: <strong className="font-mono">{profile.accountNumber}</strong></p>
              <p>IFSC: <strong className="font-mono">{profile.ifscCode}</strong></p>
              <p>UPI ID: <strong className="font-mono text-blue-700">{profile.upiId}</strong></p>
            </div>

            <div className="border border-gray-300 p-3 rounded space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{printInvoiceData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST ({printInvoiceData.taxRate}%):</span>
                <span>₹{printInvoiceData.taxAmount.toFixed(2)}</span>
              </div>
              {printInvoiceData.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-₹{printInvoiceData.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm border-t-2 border-black pt-1">
                <span>Grand Total:</span>
                <span>₹{printInvoiceData.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Amount Paid:</span>
                <span>₹{printInvoiceData.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-red-600">
                <span>Balance Due:</span>
                <span>₹{printInvoiceData.balanceDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Signature */}
          <div className="flex justify-between items-end border-t border-gray-300 pt-4 text-[10px] text-gray-600">
            <div className="max-w-md">
              <p className="font-bold text-black uppercase mb-1">Terms & Conditions:</p>
              <p className="whitespace-pre-line leading-relaxed">{profile.terms}</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-black mb-8">For, {profile.name}</p>
              <p className="border-t border-gray-400 pt-1">Authorized Signatory</p>
            </div>
          </div>

          <div className="text-center mt-6 no-print">
            <button
              onClick={() => setPrintInvoiceData(null)}
              className="px-4 py-2 bg-gray-800 text-white rounded text-xs"
            >
              Close Print Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
