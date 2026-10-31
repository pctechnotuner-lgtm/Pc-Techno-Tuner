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
  ProductCategory,
  PRODUCT_CATEGORIES,
} from '../types';
import { getT } from '../i18n';

interface SalesBillingViewProps {
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];
  profile: CompanyProfile;
  lang: Language;
  onSaveInvoice: (invoice: Invoice) => void;
  onSaveProduct: (product: Product) => void;
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
  onSaveProduct,
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
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickCategory, setQuickCategory] = useState<ProductCategory>('Computer Accessories');
  const [quickBrand, setQuickBrand] = useState('');
  const [quickModel, setQuickModel] = useState('');
  const [quickPurchase, setQuickPurchase] = useState(0);
  const [quickSelling, setQuickSelling] = useState(0);
  const [quickStock, setQuickStock] = useState(1);

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

  const handleQuickAddProduct = () => {
    if (!quickName.trim() || quickSelling <= 0) {
      alert('Please enter item name and selling price.');
      return;
    }
    const product: Product = {
      id: 'prod-' + Date.now(),
      name: quickName.trim(),
      category: quickCategory,
      brand: quickBrand.trim(),
      model: quickModel.trim(),
      specifications: '',
      purchasePrice: Number(quickPurchase) || 0,
      sellingPrice: Number(quickSelling) || 0,
      stockQuantity: Math.max(0, Number(quickStock) || 0),
      minStockAlert: 2,
      warrantyMonths: 0,
      imageUrl: '',
      createdAt: new Date().toISOString(),
    };
    onSaveProduct(product);
    const basePrice = Math.round((product.sellingPrice / (1 + taxRate / 100)) * 100) / 100;
    setItems((current) => [...current, {
      productId: product.id,
      description: product.name + (product.brand || product.model ? ' (' + [product.brand, product.model].filter(Boolean).join(' ') + ')' : ''),
      category: product.category,
      quantity: 1,
      unitPrice: basePrice,
      lineTotal: basePrice,
    }]);
    setQuickAddOpen(false);
    setQuickName('');
    setQuickBrand('');
    setQuickModel('');
    setQuickPurchase(0);
    setQuickSelling(0);
    setQuickStock(1);
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

  // Estimated profit uses the saved purchase cost from Products/Stock.
  // GST is excluded from sales revenue; invoice discount reduces profit.
  const knownCostItems = items.filter((item) => item.productId && products.some((p) => p.id === item.productId));
  const purchaseCostTotal = knownCostItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? product.purchasePrice * (Number(item.quantity) || 0) : 0);
  }, 0);
  const estimatedProfit = subtotal - purchaseCostTotal - (Number(discount) || 0);
  const itemsWithoutCost = items.filter((item) => !item.productId || !products.some((p) => p.id === item.productId)).length;

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
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setQuickAddOpen(true)} className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 text-[11px]">
                      <PlusCircle className="w-3.5 h-3.5" /><span>New Item + Save to Stock</span>
                    </button>
                    <button type="button" onClick={addItemRow} className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 text-[11px]">
                      <Plus className="w-3.5 h-3.5" /><span>Add Item</span>
                    </button>
                  </div>
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

              {quickAddOpen && (
                <div className="bg-gray-950 border border-emerald-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-emerald-400">Add New Item — Invoice + Product Stock</strong>
                    <button type="button" onClick={() => setQuickAddOpen(false)} className="text-gray-400"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input required value={quickName} onChange={e => setQuickName(e.target.value)} placeholder="Item / Product name *" className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" />
                    <select value={quickCategory} onChange={e => setQuickCategory(e.target.value as ProductCategory)} className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white">
                      {PRODUCT_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                    </select>
                    <input value={quickBrand} onChange={e => setQuickBrand(e.target.value)} placeholder="Brand (optional)" className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" />
                    <input value={quickModel} onChange={e => setQuickModel(e.target.value)} placeholder="Model (optional)" className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" />
                    <label className="text-xs text-gray-300">Purchase Price / Cost Price (₹)<input type="number" min="0" step="0.01" value={quickPurchase} onChange={e => setQuickPurchase(Number(e.target.value))} placeholder="Enter purchase price" className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" /></label>
                    <label className="text-xs text-gray-300">Sale Price (₹, GST included) *<input required type="number" min="0.01" step="0.01" value={quickSelling} onChange={e => setQuickSelling(Number(e.target.value))} placeholder="Enter sale price" className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" /></label>
                    <input type="number" min="0" value={quickStock} onChange={e => setQuickStock(Number(e.target.value))} placeholder="Opening stock quantity" className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" />
                    <button type="button" onClick={handleQuickAddProduct} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-2 font-bold">Save Item & Add to Invoice</button>
                  </div>
                  <p className="text-[10px] text-gray-400">Item Products/Stock list mein bhi save hoga aur is invoice mein bhi add ho jayega.</p>
                </div>
              )}

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

                  <div className="mt-3 pt-3 border-t border-emerald-800 space-y-1.5">
                    <div className="text-emerald-400 font-bold text-xs">ADMIN ONLY — PROFIT ESTIMATE</div>
                    <div className="flex justify-between gap-6 text-gray-400">
                      <span>Sale Value (before GST):</span>
                      <span className="font-mono text-white">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-6 text-gray-400">
                      <span>Purchase Cost:</span>
                      <span className="font-mono text-white">₹{purchaseCostTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-6 font-bold text-sm">
                      <span className="text-gray-200">Estimated Profit:</span>
                      <span className={`font-mono ${estimatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>₹{estimatedProfit.toFixed(2)}</span>
                    </div>
                    {itemsWithoutCost > 0 && <p className="text-[10px] text-amber-400">{itemsWithoutCost} item(s) without a linked stock purchase price are not included in cost calculation.</p>}
                    <p className="text-[10px] text-gray-500">Estimate only; GST excluded. Discount deducted. Other expenses not included.</p>
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

      {/* Printable Invoice Overlay — A4 layout based on the supplied reference PDF */}
      {printInvoiceData && (
        <div className="print-only hidden bg-white text-black">
          {(() => {
            const inv = printInvoiceData;
            const money = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            const dateText = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB') : '';
            const due = new Date(`${inv.invoiceDate}T00:00:00`);
            due.setDate(due.getDate() + 7);
            const dueDate = due.toLocaleDateString('en-GB');
            const taxable = Number(inv.subtotal || 0);
            const gst = Number(inv.taxAmount || 0);
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
            return (
              <div className="invoice-sheet">
                <div className="invoice-caption"><strong>TAX INVOICE</strong><span>ORIGINAL FOR RECIPIENT</span></div>
                <div className="invoice-header">
                  <div className="invoice-company">
                    {profile.logoUrl ? <img src={profile.logoUrl} alt="Company logo" className="invoice-logo" /> : null}
                    <div>
                      <h1>{profile.name || 'PC TECHNO TUNER'}</h1>
                      <p>{profile.address}{profile.location ? `, ${profile.location}` : ''}{profile.pincode ? `, ${profile.pincode}` : ''}</p>
                      <p><b>GSTIN:</b> {profile.gstin || '-'} <b className="invoice-mobile-label">Mobile:</b> {profile.mobile || '-'}</p>
                      <p><b>PAN Number:</b> {profile.pan || '-'}</p>
                      <p><b>Email:</b> {profile.email || '-'}</p>
                      <p><b>Website:</b> www.pctechnotuner.com</p>
                    </div>
                  </div>
                  <div className="invoice-meta">
                    <div><b>Invoice No.</b><span>{inv.invoiceNo}</span></div>
                    <div><b>Invoice Date</b><span>{dateText(inv.invoiceDate)}</span></div>
                    <div><b>Due Date</b><span>{dueDate}</span></div>
                  </div>
                </div>
                <div className="invoice-parties">
                  <section><h3>BILL TO</h3><b>{inv.customerBusiness || inv.customerName}</b>
                    {inv.customerBusiness && <p>{inv.customerName}</p>}
                    <p><b>Address:</b> {inv.customerAddress || '-'}</p>
                    <p><b>GSTIN:</b> {inv.customerGstin || '-'}</p>
                    <p><b>Mobile:</b> {inv.customerMobile || '-'}</p>
                  </section>
                  <section><h3>SHIP TO</h3><b>{inv.customerBusiness || inv.customerName}</b>
                    {inv.customerBusiness && <p>{inv.customerName}</p>}
                    <p><b>Address:</b> {inv.customerAddress || '-'}</p>
                    <p><b>Place of Supply:</b> Gujarat</p>
                  </section>
                </div>
                <table className="invoice-items">
                  <thead><tr><th>S.NO.</th><th>ITEMS</th><th>QTY.</th><th>RATE</th><th>TAX</th><th>AMOUNT</th></tr></thead>
                  <tbody>
                    {inv.items.map((it, idx) => {
                      const lineTax = Number(it.lineTotal || 0) * Number(inv.taxRate || 0) / 100;
                      return <tr key={idx}><td>{idx + 1}</td><td className="invoice-item-name">{it.description}{it.category ? <small>{it.category}</small> : null}</td><td>{it.quantity} PCS</td><td>{money(it.unitPrice)}</td><td>{money(lineTax)}<small>({inv.taxRate}%)</small></td><td>{money(Number(it.lineTotal || 0) + lineTax)}</td></tr>;
                    })}
                    {Array.from({ length: Math.max(0, 5 - inv.items.length) }).map((_, idx) => <tr className="invoice-empty-row" key={`empty-${idx}`}><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>)}
                  </tbody>
                  <tfoot><tr><td colSpan={2} className="invoice-total-label">TOTAL</td><td>{inv.items.reduce((s, it) => s + Number(it.quantity || 0), 0)}</td><td></td><td>{money(gst)}</td><td>{money(inv.totalAmount)}</td></tr>
                    <tr><td colSpan={5} className="invoice-total-label">RECEIVED AMOUNT</td><td>{money(inv.amountPaid)}</td></tr></tfoot>
                </table>
                <table className="invoice-gst">
                  <thead><tr><th rowSpan={2}>HSN/SAC</th><th rowSpan={2}>Taxable Value</th><th colSpan={2}>CGST</th><th colSpan={2}>SGST</th><th rowSpan={2}>Total Tax Amount</th></tr><tr><th>Rate</th><th>Amount</th><th>Rate</th><th>Amount</th></tr></thead>
                  <tbody><tr><td>-</td><td>{money(taxable)}</td><td>{(Number(inv.taxRate || 0) / 2).toFixed(2).replace(/\\.00$/, '')}%</td><td>{money(halfTax)}</td><td>{(Number(inv.taxRate || 0) / 2).toFixed(2).replace(/\\.00$/, '')}%</td><td>{money(halfTax)}</td><td>{money(gst)}</td></tr></tbody>
                </table>
                <div className="invoice-words"><b>Total Amount (in words)</b><span>{amountWords(inv.totalAmount)}</span></div>
                <div className="invoice-bottom">
                  <section className="invoice-bank"><h3>Bank Details</h3>
                    <p><b>Name:</b> {profile.name || 'PC TECHNO TUNER'}</p>
                    <p><b>IFSC Code:</b> {profile.ifscCode || '-'}</p>
                    <p><b>Account No:</b> {profile.accountNumber || '-'}</p>
                    <p><b>Bank:</b> {profile.bankName || '-'}</p>
                    <p><b>UPI ID:</b> {profile.upiId || '-'}</p>
                    <p><b>Payment Method:</b> {inv.paymentMethod}</p>
                  </section>
                  <section className="invoice-qr"><h3>Payment Details</h3><p>Scan and pay using UPI app</p><b>{profile.upiId || 'UPI ID not configured'}</b><p className="invoice-qr-amount">Amount Due: {money(inv.balanceDue)}</p></section>
                </div>
                <div className="invoice-footer">
                  <section><h3>Terms and Conditions</h3><p>{profile.terms || '1. Goods once sold will not be taken back.\n2. Warranty as per terms & condition of the manufacturer & distributor.\n3. Subject to Ahmedabad Jurisdiction Only.'}</p></section>
                  <section className="invoice-sign"><b>Authorised Signatory For</b><strong>{profile.name || 'PC TECHNO TUNER'}</strong></section>
                </div>
                <div className="no-print invoice-preview-close"><button onClick={() => setPrintInvoiceData(null)}>Close Print Preview</button></div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
