import React, { useEffect, useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Search,
  Calendar,
  X,
  Save,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';
import {
  ExpenseCategory,
  IncomeCategory,
  Language,
  PaymentMethod,
  Transaction,
  Invoice,
  OutwardRecord,
  Customer,
} from '../types';
import { getT } from '../i18n';

interface AccountingViewProps {
  transactions: Transaction[];
  invoices: Invoice[];
  outwardRecords: OutwardRecord[];
  customers: Customer[];
  lang: Language;
  onSaveTransaction: (transaction: Transaction) => void;
  onSaveOutwardRecord: (record: OutwardRecord) => void;
  onSaveInvoice: (invoice: Invoice) => void;
  onDeleteTransaction: (id: string) => void;
  onExportCsv: () => void;
  initialEntryType?: 'INCOME' | 'EXPENSE';
  openEntryOnMount?: boolean;
}

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Product sales',
  'Computer and laptop repair income',
  'CCTV installation and service income',
  'Software and IT service income',
  'Other income',
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Product purchases',
  'Shop expenses',
  'Transport expenses',
  'Technician charges',
  'Internet and electricity',
  'Other expenses',
];

export const AccountingView: React.FC<AccountingViewProps> = ({
  transactions,
  invoices,
  outwardRecords,
  customers,
  lang,
  onSaveTransaction,
  onSaveOutwardRecord,
  onSaveInvoice,
  onDeleteTransaction,
  onExportCsv,
  initialEntryType,
  openEntryOnMount = false,
}) => {
  const t = getT(lang);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [sourceEditAmount, setSourceEditAmount] = useState('');
  const [sourceEditDate, setSourceEditDate] = useState('');
  const [sourceEditMethod, setSourceEditMethod] = useState<PaymentMethod>('UPI');
  const [sourceEditMode, setSourceEditMode] = useState(false);

  // Form State
  const [formType, setFormType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [formCategory, setFormCategory] = useState<string>(INCOME_CATEGORIES[0]);
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formMethod, setFormMethod] = useState<PaymentMethod>('UPI');
  const [formParty, setFormParty] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formRef, setFormRef] = useState('');
  const [customerPaymentKind, setCustomerPaymentKind] = useState<'ADVANCE' | 'OLD_BILL'>('ADVANCE');
  const [selectedBillId, setSelectedBillId] = useState('');

  const openAddModal = (type: 'INCOME' | 'EXPENSE' = 'INCOME') => {
    setFormType(type);
    setFormCategory(type === 'INCOME' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    setFormAmount(0);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMethod('UPI');
    setFormParty('');
    setFormNotes('');
    setFormRef('');
    setCustomerPaymentKind('ADVANCE');
    setSelectedBillId('');
    setModalOpen(true);
  };

  useEffect(() => {
    if (openEntryOnMount && initialEntryType) {
      setFormType(initialEntryType);
      setFormCategory(initialEntryType === 'INCOME' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
      setModalOpen(false);
    }
  }, [openEntryOnMount, initialEntryType]);

  const editSourcePayment = () => {
    if (!selectedTransaction) return;
    setSourceEditAmount(String(selectedTransaction.amount || 0));
    setSourceEditDate(selectedTransaction.date);
    setSourceEditMethod(selectedTransaction.paymentMethod);
    setSourceEditMode(true);
  };
  const saveSourcePayment = () => {
    if (!selectedTransaction || Number(sourceEditAmount) < 0 || !sourceEditDate) return;
    const isOutward = selectedTransaction.id.startsWith('auto-outward-payment-');
    const isInvoice = selectedTransaction.id.startsWith('auto-invoice-payment-');
    const sourceId = selectedTransaction.id.replace(/^auto-(?:outward|invoice)-payment-/, '');
    if (isOutward) {
      const record = outwardRecords.find((r) => r.id === sourceId);
      if (!record) return alert('Outward record not found.');
      onSaveOutwardRecord({ ...record, amountCollected: Number(sourceEditAmount), outDate: sourceEditDate, paymentMethod: sourceEditMethod as 'UPI' | 'Cash' });
    } else if (isInvoice) {
      const invoice = invoices.find((r) => r.id === sourceId);
      if (!invoice) return alert('Invoice not found.');
      const paid = Number(sourceEditAmount);
      onSaveInvoice({ ...invoice, amountPaid: paid, balanceDue: Math.max(0, Number(invoice.totalAmount || 0) - paid), paymentStatus: paid >= Number(invoice.totalAmount || 0) ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID', invoiceDate: sourceEditDate, paymentMethod: sourceEditMethod });
    }
    setSourceEditMode(false);
    setSelectedTransaction(null);
  };

  const editSelectedTransaction = () => {
    if (!selectedTransaction || selectedTransaction.id.startsWith('auto-')) return;
    setFormType(selectedTransaction.type);
    setFormCategory(selectedTransaction.category);
    setFormAmount(selectedTransaction.amount);
    setFormDate(selectedTransaction.date);
    setFormMethod(selectedTransaction.paymentMethod);
    setFormParty(selectedTransaction.partyName);
    setFormNotes(selectedTransaction.notes || '');
    setFormRef(selectedTransaction.referenceId || '');
    setSelectedTransaction(null);
    setModalOpen(true);
  };

  const printSelectedTransaction = () => {
    if (!selectedTransaction) return;
    const isOutward = selectedTransaction.id.startsWith('auto-outward-payment-');
    const isInvoice = selectedTransaction.id.startsWith('auto-invoice-payment-');
    const sourceId = selectedTransaction.id.replace(/^auto-(?:outward|invoice)-payment-/, '');
    const outward = isOutward ? outwardRecords.find((r) => r.id === sourceId) : undefined;
    const invoice = isInvoice ? invoices.find((r) => r.id === sourceId) : undefined;
    const esc = (v: unknown) => String(v ?? '—').replace(/[&<>"]/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch] || ch));
    const rows: [string, unknown][] = outward ? [
      ['Outward ID',outward.id],['Inward ID',outward.inwardRecordId],['Product',outward.productName],['Customer',outward.customerName],['Mobile',outward.phoneNumber],['Inward Date',outward.inwardDate],['Outward Date',outward.outDate],['Problem',outward.inwardProblem],['Work / Solution',outward.solution],['Estimate',outward.estimateAmount],['Received',outward.amountCollected],['Settlement',outward.settlementApplied ? 'Settled' : 'Not settled'],['Settlement Note',outward.settlementNote]
    ] : invoice ? [
      ['Invoice No.',invoice.invoiceNo],['Invoice Date',invoice.invoiceDate],['Customer',invoice.customerName],['Mobile',invoice.customerMobile],['Address',invoice.customerAddress],['GSTIN',invoice.customerGstin],['Subtotal',invoice.subtotal],['Tax',invoice.taxAmount],['Discount',invoice.discount],['Invoice Total',invoice.totalAmount],['Paid',invoice.amountPaid],['Balance Due',invoice.balanceDue]
    ] : [['Notes',selectedTransaction.notes]];
    const itemRows = invoice?.items.map(item => '<tr><td>'+esc(item.description)+'</td><td>'+esc(item.quantity)+'</td><td>₹'+esc(item.unitPrice)+'</td><td>₹'+esc(item.lineTotal)+'</td></tr>').join('') || '';
    const win = window.open('', '_blank', 'width=900,height=750');
    if (!win) { alert('Please allow pop-ups to print.'); return; }
    win.document.write('<!doctype html><html><head><title>PC TECHNO TUNER Payment</title><style>body{font:14px Arial;color:#172033;padding:28px}.sheet{max-width:780px;margin:auto}h1{font-size:22px}.brand{color:#087e9b;font-weight:bold;letter-spacing:1px;border-bottom:2px solid #0e7490;padding-bottom:12px}.row{display:flex;justify-content:space-between;border-bottom:1px solid #ddd;padding:9px 0;gap:20px}.row span{color:#64748b}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{padding:9px;border:1px solid #ddd;text-align:left}@media print{body{padding:0}}</style></head><body><main class="sheet"><div class="brand">PC TECHNO TUNER • PAYMENT RECEIPT / DETAILS</div><h1>'+esc(isOutward?'Outward Service Payment':isInvoice?'Sales Invoice Payment':selectedTransaction.type+' Entry')+'</h1><p>'+esc(selectedTransaction.partyName)+' • '+esc(selectedTransaction.date)+'</p><div class="row"><span>Amount Received</span><b>₹'+esc(Number(selectedTransaction.amount).toLocaleString('en-IN'))+'</b></div><div class="row"><span>Payment Method</span><b>'+esc(selectedTransaction.paymentMethod)+'</b></div><div class="row"><span>Reference</span><b>'+esc(selectedTransaction.referenceId)+'</b></div>'+rows.map(([k,v])=>'<div class="row"><span>'+esc(k)+'</span><b>'+esc(v)+'</b></div>').join('')+(itemRows?'<h3>Invoice Items</h3><table><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr>'+itemRows+'</table>':'')+'<p style="margin-top:30px;color:#64748b">info@pctechnotuner.com • www.pctechnotuner.com • 7383871195</p></main><script>window.onload=()=>setTimeout(()=>window.print(),250)</script></body></html>');
    win.document.close();
  };

  const handleTypeChange = (type: 'INCOME' | 'EXPENSE') => {
    setFormType(type);
    setFormCategory(type === 'INCOME' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const matchedCustomer = customers.find((customer) => [customer.name, customer.businessName, customer.mobile].some((v) => v && v.toLowerCase() === formParty.trim().toLowerCase()));
  const customerOpenBills = invoices.filter((invoice) => Number(invoice.balanceDue || 0) > 0 && (invoice.customerName || '').toLowerCase() === formParty.trim().toLowerCase());
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (formType === 'INCOME' && customerPaymentKind === 'OLD_BILL' && !selectedBillId) {
      alert('Please select the pending bill for this payment.');
      return;
    }
    if (formType === 'INCOME' && customerPaymentKind === 'OLD_BILL') {
      const bill = invoices.find((item) => item.id === selectedBillId);
      if (!bill) return alert('Selected bill not found.');
      const received = Number(formAmount);
      if (received > Number(bill.balanceDue || 0)) return alert('Payment amount cannot exceed this bill balance.');
      const paid = Number(bill.amountPaid || 0) + received;
      onSaveInvoice({ ...bill, amountPaid: paid, balanceDue: Math.max(0, Number(bill.totalAmount || 0) - paid), paymentStatus: paid >= Number(bill.totalAmount || 0) ? 'PAID' : 'PARTIAL', paymentMethod: formMethod });
      setModalOpen(false);
      return;
    }

    const newTx: Transaction = {
      id: selectedTransaction && !selectedTransaction.id.startsWith('auto-') ? selectedTransaction.id : `tr-${Date.now()}`,
      type: formType,
      category: formType === 'INCOME' && customerPaymentKind === 'ADVANCE' ? 'Customer advance payment' : formCategory,
      amount: Number(formAmount),
      date: formDate,
      paymentMethod: formMethod,
      partyName: formParty.trim() || 'General Customer/Supplier',
      referenceId: formRef.trim() || undefined,
      notes: formType === 'INCOME' && customerPaymentKind === 'ADVANCE' ? ['Advance payment', formNotes.trim()].filter(Boolean).join(' • ') : formNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveTransaction(newTx);
    setModalOpen(false);
    setSelectedTransaction(null);
  };

  // Automatically include money actually received against invoices and outward service jobs.
  // These are derived from the saved invoice/outward records; waived settlements are not cash income.
  const receivedPaymentTransactions: Transaction[] = [
    ...invoices.filter((invoice) => Number(invoice.amountPaid || 0) > 0).map((invoice) => ({
      id: 'auto-invoice-payment-' + invoice.id,
      type: 'INCOME' as const,
      category: 'Customer invoice payment',
      amount: Number(invoice.amountPaid || 0),
      date: invoice.invoiceDate,
      paymentMethod: invoice.paymentMethod,
      partyName: invoice.customerName,
      referenceId: invoice.invoiceNo || invoice.id,
      notes: 'Auto-added from received invoice payment',
      createdAt: invoice.createdAt,
    })),
    ...outwardRecords.filter((record) => Number(record.amountCollected || 0) > 0).map((record) => ({
      id: 'auto-outward-payment-' + record.id,
      type: 'INCOME' as const,
      category: 'Computer and laptop repair income',
      amount: Number(record.amountCollected || 0),
      date: record.outDate,
      paymentMethod: record.paymentMethod,
      partyName: record.customerName,
      referenceId: record.inwardRecordId,
      notes: 'Auto-added from outward service payment',
      createdAt: record.createdAt,
    })),
  ];
  const allTransactions = [...transactions, ...receivedPaymentTransactions];

  // Metrics
  const totalIncome = allTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = allTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpense;

  // Filtered list
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const accountingCategories = Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, ...allTransactions.map((tx) => tx.category).filter(Boolean)])).sort((a, b) => a.localeCompare(b));
  const filtered = allTransactions.filter((tx) => {
    const matchesType = filterType === 'ALL' || tx.type === filterType;
    const matchesCat = filterCategory === 'ALL' || tx.category === filterCategory;
    const matchesDate = !dateRange || tx.date === dateRange;
    const linkedCustomer = customers.find((customer) =>
      [customer.name, customer.businessName, customer.mob].some((value) =>
        String(value || '').trim().toLocaleLowerCase() === String(tx.partyName || '').trim().toLocaleLowerCase()
      )
    );
    const searchableText = [tx.category, tx.partyName, tx.notes, tx.referenceId, linkedCustomer?.name, linkedCustomer?.businessName, linkedCustomer?.mob]
      .map((value) => String(value || '').toLocaleLowerCase()).join(' ');
    const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
    return matchesType && matchesCat && matchesDate && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-500" />
            <span>Basic Accounting & Cash Book</span>
          </h1>
          <p className="text-xs text-gray-400">
            Private administrator cash ledger for daily income, hardware purchases, and operating expenses.
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
            onClick={() => openAddModal('INCOME')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+ Income</span>
          </button>

          <button
            onClick={() => openAddModal('EXPENSE')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>- Expense</span>
          </button>
        </div>
      </div>

      {/* Financial overview moved here from the dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1"><span>Cash Inflow (Income)</span><TrendingUp className="w-4 h-4 text-emerald-400" /></div>
          <p className="text-2xl font-black text-emerald-400 font-mono">₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <span className="text-[10px] text-gray-500">Total realized payments (UPI, Cash, Bank)</span>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1"><span>Cash Outflow (Expenses)</span><TrendingDown className="w-4 h-4 text-rose-400" /></div>
          <p className="text-2xl font-black text-rose-400 font-mono">₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <span className="text-[10px] text-gray-500">Purchases, wages, shop rent & utilities</span>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1"><span>Outstanding Receivables</span><Info className="w-4 h-4 text-amber-400" /></div>
          <p className="text-2xl font-black text-amber-400 font-mono">₹{invoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <span className="text-[10px] text-gray-500">Unpaid invoice balances from customers</span>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1"><span>Net Cash Flow</span><DollarSign className="w-4 h-4 text-blue-400" /></div>
          <p className={`text-2xl font-black font-mono ${netCashFlow >= 0 ? 'text-white' : 'text-rose-400'}`}>₹{netCashFlow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <span className="text-[10px] text-gray-500">Cash In minus Cash Out; not accounting profit</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search party, notes, reference..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Types (Income & Expense)</option>
            <option value="INCOME">Income Only</option>
            <option value="EXPENSE">Expense Only</option>
          </select>
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Accounting Categories</option>
            {accountingCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="date"
                onClick={(e) => e.currentTarget.showPicker?.()}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            title="Filter by transaction date"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950 text-gray-400 uppercase font-bold border-b border-gray-800 tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Party / Customer / Vendor</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Ref / Notes</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((tx) => (
                <tr key={tx.id} onClick={() => setSelectedTransaction(tx)} className="cursor-pointer hover:bg-blue-950/30 transition">
                  <td className="py-3 px-4 text-gray-400 font-mono">{tx.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'INCOME'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">{tx.category}</td>
                  <td className="py-3 px-4 text-gray-300">{tx.partyName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-gray-950 text-[10px] text-gray-400 border border-gray-800 font-mono">
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td
                    className={`py-3 px-4 font-mono font-bold ${
                      tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-[11px] max-w-xs">
                    {tx.referenceId && (
                      <span className="font-mono text-blue-400 block text-[10px]">{tx.referenceId}</span>
                    )}
                    <span className="line-clamp-1">{tx.notes || '-'}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!tx.id.startsWith('auto-invoice-payment-') && !tx.id.startsWith('auto-outward-payment-') && <button
                      onClick={(event) => {
                        event.stopPropagation();
                        if (confirm('Delete this accounting entry?')) onDeleteTransaction(tx.id);
                      }}
                      className="text-gray-500 hover:text-rose-400 text-xs transition"
                    >
                      Delete
                    </button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {selectedTransaction && (() => {
        const isOutward = selectedTransaction.id.startsWith('auto-outward-payment-');
        const isInvoice = selectedTransaction.id.startsWith('auto-invoice-payment-');
        const sourceId = selectedTransaction.id.replace(/^auto-(?:outward|invoice)-payment-/, '');
        const outward = isOutward ? outwardRecords.find((r) => r.id === sourceId) : undefined;
        const invoice = isInvoice ? invoices.find((r) => r.id === sourceId) : undefined;
        const rows: [string, string][] = outward ? [
          ['Outward ID', outward.id], ['Inward ID', outward.inwardRecordId], ['Product / Device', outward.productName],
          ['Customer', outward.customerName], ['Mobile', outward.phoneNumber], ['Inward Date', outward.inwardDate],
          ['Outward Date', outward.outDate], ['Reported Problem', outward.inwardProblem], ['Work / Solution', outward.solution],
          ['Estimate Amount', '₹' + Number(outward.estimateAmount || 0).toLocaleString('en-IN')],
          ['Amount Collected', '₹' + Number(outward.amountCollected || 0).toLocaleString('en-IN')],
          ['Settlement', outward.settlementApplied ? 'Settled / balance waived' : 'Not settled'],
          ['Settlement Note', outward.settlementNote || '—'], ['Delivered By', outward.deliveryBy || '—']
        ] : [];
        return (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedTransaction(null)}>
            <section role="dialog" aria-modal="true" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-500/30 bg-gray-950 text-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <header className="flex items-start justify-between gap-3 border-b border-gray-800 bg-gray-900 p-5">
                <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">PC TECHNO TUNER • Payment Details</p>
                  <h2 className="mt-1 text-xl font-black">{isOutward ? 'Outward Service Payment' : isInvoice ? 'Sales Bill / Invoice Payment' : selectedTransaction.type === 'INCOME' ? 'Income Entry' : 'Expense Entry'}</h2>
                  <p className="mt-1 text-sm text-gray-400">{selectedTransaction.partyName}</p></div>
                <button type="button" onClick={() => setSelectedTransaction(null)} className="rounded-lg border border-gray-700 p-2"><X className="h-5 w-5"/></button>
              </header>
              <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
                {([['Date',selectedTransaction.date],['Payment Type',isOutward ? 'Outward' : isInvoice ? 'Sales Bill / Invoice' : selectedTransaction.type],['Method',selectedTransaction.paymentMethod],['Amount Received','₹' + Number(selectedTransaction.amount || 0).toLocaleString('en-IN')],['Reference ID',selectedTransaction.referenceId || '—'],['Category',selectedTransaction.category]] as [string,string][]).map(([label,value]) => <div key={label} className="rounded-xl border border-gray-800 bg-gray-900 p-3"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 break-words text-sm font-bold">{value}</p></div>)}
              </div>
              {outward && <div className="px-5 pb-5"><h3 className="mb-2 font-bold text-cyan-300">Outward / Service Details</h3><div className="rounded-xl border border-gray-800 p-4">{rows.map(([label,value]) => <div key={label} className="flex flex-wrap justify-between gap-2 border-b border-gray-800 py-2 text-sm"><span className="text-gray-400">{label}</span><strong className="max-w-[65%] break-words text-right">{value}</strong></div>)}</div></div>}
              {invoice && <div className="px-5 pb-5"><h3 className="mb-2 font-bold text-cyan-300">Sales Bill / Invoice Details</h3><div className="rounded-xl border border-gray-800 p-4">
                {([['Invoice No.',invoice.invoiceNo],['Invoice Date',invoice.invoiceDate],['Customer',invoice.customerName],['Mobile',invoice.customerMobile],['Address',invoice.customerAddress],['GSTIN',invoice.customerGstin || '—'],['Subtotal','₹' + Number(invoice.subtotal || 0).toLocaleString('en-IN')],['Tax','₹' + Number(invoice.taxAmount || 0).toLocaleString('en-IN')],['Discount','₹' + Number(invoice.discount || 0).toLocaleString('en-IN')],['Invoice Total','₹' + Number(invoice.totalAmount || 0).toLocaleString('en-IN')],['Total Paid','₹' + Number(invoice.amountPaid || 0).toLocaleString('en-IN')],['Balance Due','₹' + Number(invoice.balanceDue || 0).toLocaleString('en-IN')]] as [string,string][]).map(([label,value]) => <div key={label} className="flex justify-between gap-2 border-b border-gray-800 py-2 text-sm"><span className="text-gray-400">{label}</span><strong>{value}</strong></div>)}
                <h4 className="mt-4 font-bold text-cyan-300">Bill Items</h4><div className="mt-2 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr><th className="p-2">Item</th><th className="p-2">Qty</th><th className="p-2">Rate</th><th className="p-2">Total</th></tr></thead><tbody>{invoice.items.map((item,index) => <tr key={index} className="border-t border-gray-800"><td className="p-2">{item.description}</td><td className="p-2">{item.quantity}</td><td className="p-2">₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}</td><td className="p-2">₹{Number(item.lineTotal || 0).toLocaleString('en-IN')}</td></tr>)}</tbody></table></div>
              </div></div>}
              {!outward && !invoice && <div className="px-5 pb-5"><div className="rounded-xl border border-gray-800 p-4"><h3 className="mb-2 font-bold text-cyan-300">Entry Notes</h3><p className="text-sm text-gray-300">{selectedTransaction.notes || 'No additional details recorded.'}</p></div></div>}
              {sourceEditMode && <div className="mx-5 mb-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4"><h3 className="mb-3 font-bold text-amber-200">Edit Received Payment</h3><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><label className="text-xs text-gray-300">Amount Received<input type="number" min="0" value={sourceEditAmount} onChange={(e) => setSourceEditAmount(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 p-2 text-sm text-white"/></label><label className="text-xs text-gray-300">Payment Date<input type="date" value={sourceEditDate} onChange={(e) => setSourceEditDate(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 p-2 text-sm text-white"/></label><label className="text-xs text-gray-300">Method<select value={sourceEditMethod} onChange={(e) => setSourceEditMethod(e.target.value as PaymentMethod)} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 p-2 text-sm text-white"><option value="UPI">UPI</option><option value="Cash">Cash</option><option value="Bank Transfer">Bank Transfer</option><option value="Card">Card</option></select></label></div><div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setSourceEditMode(false)} className="rounded-lg border border-gray-700 px-3 py-2 text-sm">Cancel</button><button type="button" onClick={saveSourcePayment} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold">Save Changes</button></div></div>}
              <footer className="flex flex-wrap justify-between gap-2 border-t border-gray-800 p-4">
                <div className="flex flex-wrap gap-2"><button type="button" onClick={printSelectedTransaction} className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-gray-950">Print / Save PDF</button>
                {selectedTransaction.id.startsWith('auto-') ? <button type="button" onClick={editSourcePayment} className="rounded-xl border border-amber-500/40 px-4 py-2.5 text-sm font-bold text-amber-300">Edit Payment</button> : <button type="button" onClick={editSelectedTransaction} className="rounded-xl border border-amber-500/40 px-4 py-2.5 text-sm font-bold text-amber-300">Edit Entry</button>}</div>
                <button type="button" onClick={() => setSelectedTransaction(null)} className="rounded-xl border border-gray-700 px-5 py-2.5 text-sm font-bold">Close</button>
              </footer>
            </section>
          </div>
        );
      })()}

      {/* Add Transaction Modal */}
      {(modalOpen || openEntryOnMount) && (
        <div className={openEntryOnMount ? 'w-full' : 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto'}>
          <div className={openEntryOnMount ? 'w-full max-w-3xl bg-gray-900/70 border border-gray-800 rounded-2xl p-5 sm:p-6 space-y-4' : 'w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 my-8 shadow-2xl animate-scaleUp'}>
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span>{openEntryOnMount ? (initialEntryType === 'EXPENSE' ? 'Payment Out Entry' : 'Payment In Entry') : 'New Accounting Entry'}</span>
              </h3>
              {!openEntryOnMount && <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Type toggle is only needed in the combined Accounts popup */}
              {!openEntryOnMount && <div className="grid grid-cols-2 gap-2 bg-gray-950 p-1 rounded-xl border border-gray-800">
                <button
                  type="button"
                  onClick={() => handleTypeChange('INCOME')}
                  className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    formType === 'INCOME'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Income Inflow</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('EXPENSE')}
                  className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    formType === 'EXPENSE'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Expense Outflow</span>
                </button>
              </div>}

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Party / Customer / Vendor Name</label>
                <input list="accounting-customer-options" value={formParty} onChange={(e) => setFormParty(e.target.value)} placeholder="Party ka naam ya mobile likhkar search karein..." className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white"/>
                <datalist id="accounting-customer-options">{customers.flatMap((customer) => [<option key={customer.id+'-name'} value={customer.name}/>, ...(customer.businessName ? [<option key={customer.id+'-business'} value={customer.businessName}/>] : []), <option key={customer.id+'-mobile'} value={customer.mobile}/>])}</datalist>
                {matchedCustomer && <div className="mt-2 rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3 text-xs"><b className="text-cyan-200">{matchedCustomer.name}</b><p className="mt-1 text-gray-300">{matchedCustomer.businessName || 'Individual'} • {matchedCustomer.mobile}</p><p className="text-gray-400">{matchedCustomer.address}</p>{matchedCustomer.gstin && <p className="text-gray-400">GSTIN: {matchedCustomer.gstin}</p>}</div>}
              </div>
              {formType === 'INCOME' && <>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-3 space-y-2">
                  <label className="block text-gray-300 font-bold">Payment kis liye mila?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => {setCustomerPaymentKind('ADVANCE');setSelectedBillId('');}} className={`rounded-lg border p-2 text-xs font-bold ${customerPaymentKind==='ADVANCE'?'border-emerald-400 bg-emerald-600/20 text-emerald-200':'border-gray-700 text-gray-400'}`}>Advance Payment</button>
                    <button type="button" onClick={() => setCustomerPaymentKind('OLD_BILL')} className={`rounded-lg border p-2 text-xs font-bold ${customerPaymentKind==='OLD_BILL'?'border-emerald-400 bg-emerald-600/20 text-emerald-200':'border-gray-700 text-gray-400'}`}>Old Bill Payment</button>
                  </div>
                  {customerPaymentKind === 'OLD_BILL' && <div><label className="block text-gray-400 mb-1 text-xs">Select Pending Bill</label><select value={selectedBillId} onChange={(e) => setSelectedBillId(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-950 p-2 text-white"><option value="">Select party name first, then bill</option>{customerOpenBills.map((bill) => <option key={bill.id} value={bill.id}>{bill.invoiceNo} • Due ₹{Number(bill.balanceDue).toLocaleString('en-IN')} • {bill.invoiceDate}</option>)}</select></div>}
                  {customerPaymentKind === 'ADVANCE' && <p className="text-xs text-gray-400">Ye payment party ke advance balance ke roop mein save hoga.</p>}
                </div>
              </>}
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-blue-500"
                >
                  {formType === 'INCOME'
                    ? INCOME_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))
                    : EXPENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0.01}
                    step="0.01"
                    value={formAmount || ''}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                onClick={(e) => e.currentTarget.showPicker?.()}
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Payment Method</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="UPI">UPI / GPay / QR</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Card">Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Reference ID (Optional)</label>
                  <input
                    type="text"
                    value={formRef}
                    onChange={(e) => setFormRef(e.target.value)}
                    placeholder="Invoice # / Receipt #"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Notes / Purpose</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Additional transaction context..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition flex items-center justify-center gap-1.5 ${
                  formType === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>Save Entry</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
