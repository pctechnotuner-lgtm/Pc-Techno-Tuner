import React, { useState } from 'react';
import { ClipboardList, Plus, Search, Trash2, CalendarDays, UserRound, Phone, Package, IndianRupee } from 'lucide-react';
import { InwardRecord } from '../types';

interface Props {
  records: InwardRecord[];
  onSaveRecord: (record: InwardRecord) => void;
  onDeleteRecord: (recordId: string) => void;
}

const today = () => new Date().toISOString().slice(0, 10);
const money = (value: number) => '₹' + (Number(value) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const InwardView: React.FC<Props> = ({ records, onSaveRecord, onDeleteRecord }) => {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [productName, setProductName] = useState('');
  const [inwardDate, setInwardDate] = useState(today());
  const [problem, setProblem] = useState('');
  const [estimateAmount, setEstimateAmount] = useState('');
  const [search, setSearch] = useState('');

  const resetForm = () => {
    setCustomerName('');
    setPhoneNumber('');
    setProductName('');
    setInwardDate(today());
    setProblem('');
    setEstimateAmount('');
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!customerName.trim() || !phoneNumber.trim() || !productName.trim() || !problem.trim()) {
      alert('Please enter customer name, phone number, product name and problem.');
      return;
    }
    const record: InwardRecord = {
      id: 'IN-' + Date.now(),
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      productName: productName.trim(),
      inwardDate,
      problem: problem.trim(),
      estimateAmount: Number(estimateAmount) || 0,
      createdAt: new Date().toISOString(),
    };
    onSaveRecord(record);
    resetForm();
    alert('Inward entry saved successfully.');
  };

  const filtered = records.filter((record) =>
    [record.customerName, record.phoneNumber, record.productName, record.problem]
      .join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-cyan-300"><ClipboardList className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[.18em]">Service Desk</span></div>
          <h1 className="mt-1 text-2xl font-black text-white">Inward Register</h1>
          <p className="mt-1 text-sm text-slate-400">Customer device receiving and repair estimate records</p>
        </div>
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-4 py-3">
          <div className="text-xs text-slate-400">Total inward entries</div>
          <div className="text-2xl font-bold text-cyan-300">{records.length}</div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
        <div className="mb-2 flex items-center justify-between gap-3"><div><h2 className="font-bold text-white">Search Inward History</h2><p className="text-xs text-slate-400">{filtered.length} record(s)</p></div></div>
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, product..." className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-500" /></div>
      </section>

      <form onSubmit={save} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 sm:p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-2"><Plus className="h-5 w-5 text-cyan-300" /><h2 className="text-lg font-bold text-white">New Inward Entry</h2></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5"><span className="flex items-center gap-2 text-sm font-medium text-slate-300"><UserRound className="h-4 w-4" /> Customer Name *</span><input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="Enter customer name" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500" /></label>
          <label className="space-y-1.5"><span className="flex items-center gap-2 text-sm font-medium text-slate-300"><Phone className="h-4 w-4" /> Phone Number *</span><input type="tel" inputMode="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required placeholder="Enter phone number" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500" /></label>
          <label className="space-y-1.5"><span className="flex items-center gap-2 text-sm font-medium text-slate-300"><Package className="h-4 w-4" /> Product Name *</span><input value={productName} onChange={(e) => setProductName(e.target.value)} required placeholder="Laptop / Desktop / CCTV / Printer..." className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500" /></label>
          <label className="space-y-1.5"><span className="flex items-center gap-2 text-sm font-medium text-slate-300"><CalendarDays className="h-4 w-4" /> Inward Date *</span><input type="date" value={inwardDate} onChange={(e) => setInwardDate(e.target.value)} required className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500" /></label>
          <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium text-slate-300">Problem / Customer Complaint *</span><textarea value={problem} onChange={(e) => setProblem(e.target.value)} required rows={3} placeholder="Describe the reported problem..." className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500" /></label>
          <label className="space-y-1.5"><span className="flex items-center gap-2 text-sm font-medium text-slate-300"><IndianRupee className="h-4 w-4" /> Estimate Amount (₹)</span><input type="number" min="0" step="0.01" value={estimateAmount} onChange={(e) => setEstimateAmount(e.target.value)} placeholder="0" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500" /></label>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" onClick={resetForm} className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800">Clear</button><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-cyan-500"><Plus className="h-4 w-4" /> Save Inward</button></div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70">
        <div className="border-b border-slate-700 p-4"><h2 className="font-bold text-white">Inward History</h2><p className="text-xs text-slate-400">{filtered.length} record(s)</p></div>
        {filtered.length === 0 ? <div className="p-10 text-center text-sm text-slate-400">No inward records yet. Add the first entry above.</div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Inward No.</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Inward Date</th><th className="px-4 py-3">Problem</th><th className="px-4 py-3 text-right">Estimate</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-800">{filtered.map((record) => <tr key={record.id} className="text-slate-200 hover:bg-slate-800/40"><td className="px-4 py-3 font-semibold text-cyan-300">{record.id}</td><td className="px-4 py-3"><div className="font-semibold text-white">{record.customerName}</div><div className="text-xs text-slate-400">{record.phoneNumber}</div></td><td className="px-4 py-3">{record.productName}</td><td className="px-4 py-3 whitespace-nowrap">{record.inwardDate}</td><td className="max-w-xs px-4 py-3"><div className="line-clamp-2">{record.problem}</div></td><td className="px-4 py-3 text-right font-semibold text-cyan-300">{money(record.estimateAmount)}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => { if (window.confirm('Delete this inward record?')) onDeleteRecord(record.id); }} className="rounded-lg p-2 text-rose-300 hover:bg-rose-950/50" title="Delete inward record"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody>
          </table></div>
        )}
      </section>
    </div>
  );
};
