import React, { useState } from 'react';
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
} from '../types';
import { getT } from '../i18n';

interface AccountingViewProps {
  transactions: Transaction[];
  lang: Language;
  onSaveTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onExportCsv: () => void;
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
  lang,
  onSaveTransaction,
  onDeleteTransaction,
  onExportCsv,
}) => {
  const t = getT(lang);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('');

  // Form State
  const [formType, setFormType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [formCategory, setFormCategory] = useState<string>(INCOME_CATEGORIES[0]);
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formMethod, setFormMethod] = useState<PaymentMethod>('UPI');
  const [formParty, setFormParty] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formRef, setFormRef] = useState('');

  const openAddModal = (type: 'INCOME' | 'EXPENSE' = 'INCOME') => {
    setFormType(type);
    setFormCategory(type === 'INCOME' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    setFormAmount(0);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMethod('UPI');
    setFormParty('');
    setFormNotes('');
    setFormRef('');
    setModalOpen(true);
  };

  const handleTypeChange = (type: 'INCOME' | 'EXPENSE') => {
    setFormType(type);
    setFormCategory(type === 'INCOME' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const newTx: Transaction = {
      id: `tr-${Date.now()}`,
      type: formType,
      category: formCategory,
      amount: Number(formAmount),
      date: formDate,
      paymentMethod: formMethod,
      partyName: formParty.trim() || 'General Customer/Supplier',
      referenceId: formRef.trim() || undefined,
      notes: formNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveTransaction(newTx);
    setModalOpen(false);
  };

  // Metrics
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpense;

  // Filtered list
  const filtered = transactions.filter((tx) => {
    const matchesType = filterType === 'ALL' || tx.type === filterType;
    const matchesCat = filterCategory === 'ALL' || tx.category === filterCategory;
    const matchesDate = !dateRange || tx.date === dateRange;
    const q = search.toLowerCase();
    const matchesSearch =
      tx.category.toLowerCase().includes(q) ||
      tx.partyName.toLowerCase().includes(q) ||
      (tx.notes && tx.notes.toLowerCase().includes(q)) ||
      (tx.referenceId && tx.referenceId.toLowerCase().includes(q));
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Total Realized Income</span>
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-gray-500">Sales, Repairs, CCTV and IT service income</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Total Recorded Expenses</span>
            <div className="p-1 rounded bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono">
            ₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-gray-500">Purchases, workshop rent, technician wages</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Net Operating Cash Flow</span>
            <div className="p-1 rounded bg-blue-500/10 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black font-mono ${netCashFlow >= 0 ? 'text-white' : 'text-rose-400'}`}>
            ₹{netCashFlow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-gray-500">Net surplus after paid costs</span>
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
            <optgroup label="Income Categories">
              {INCOME_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
            <optgroup label="Expense Categories">
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
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
                <tr key={tx.id} className="hover:bg-gray-800/40 transition">
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
                    <button
                      onClick={() => {
                        if (confirm('Delete this accounting entry?')) onDeleteTransaction(tx.id);
                      }}
                      className="text-gray-500 hover:text-rose-400 text-xs transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 my-8 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span>New Accounting Entry</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 bg-gray-950 p-1 rounded-xl border border-gray-800">
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
              </div>

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
                <label className="block text-gray-400 mb-1 font-semibold">Party / Customer / Vendor</label>
                <input
                  type="text"
                  value={formParty}
                  onChange={(e) => setFormParty(e.target.value)}
                  placeholder="e.g. Torrent Power / Redington / Walk-in Customer"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
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
