import React, { useMemo, useState } from 'react';
import { PackageCheck, Search, Trash2, CalendarDays, UserRound, Phone, Package, IndianRupee, ClipboardList, CheckCircle2 } from 'lucide-react';
import { InwardRecord, OutwardRecord } from '../types';

interface Props {
  inwardRecords: InwardRecord[];
  outwardRecords: OutwardRecord[];
  onSaveRecord: (record: OutwardRecord) => void;
  onDeleteRecord: (recordId: string) => void;
}

const today = () => new Date().toISOString().slice(0, 10);
const money = (value: number) => '₹' + (Number(value) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fieldClass = "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500";

export const OutwardView: React.FC<Props> = ({ inwardRecords, outwardRecords, onSaveRecord, onDeleteRecord }) => {
  const [inwardNumber, setInwardNumber] = useState('');
  const [outDate, setOutDate] = useState(today());
  const [solution, setSolution] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash'>('UPI');
  const [search, setSearch] = useState('');

  const selectedInward = useMemo(
    () => inwardRecords.find((record) => record.id === inwardNumber),
    [inwardRecords, inwardNumber]
  );
  const alreadyOutward = outwardRecords.some((record) => record.inwardRecordId === inwardNumber);

  const resetForm = () => {
    setInwardNumber('');
    setOutDate(today());
    setSolution('');
    setPaymentMethod('UPI');
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedInward) {
      alert('Please select a valid Inward Entry Number.');
      return;
    }
    if (!solution.trim()) {
      alert('Please enter the problem solution / work done.');
      return;
    }
    if (alreadyOutward) {
      alert('This inward entry is already marked as outward.');
      return;
    }
    const record: OutwardRecord = {
      id: 'OUT-' + Date.now(),
      inwardRecordId: selectedInward.id,
      customerName: selectedInward.customerName,
      phoneNumber: selectedInward.phoneNumber,
      productName: selectedInward.productName,
      inwardDate: selectedInward.inwardDate,
      inwardProblem: selectedInward.problem,
      estimateAmount: selectedInward.estimateAmount,
      outDate,
      solution: solution.trim(),
      paymentMethod,
      createdAt: new Date().toISOString(),
    };
    onSaveRecord(record);
    resetForm();
    alert('Outward entry saved successfully.');
  };

  const filtered = outwardRecords.filter((record) =>
    [record.inwardRecordId, record.customerName, record.phoneNumber, record.productName, record.solution]
      .join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-300"><PackageCheck className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[.18em]">Service Desk</span></div>
          <h1 className="mt-1 text-2xl font-black text-white">Outward Register</h1>
          <p className="mt-1 text-sm text-slate-400">Select an inward number to load the customer's complete device details</p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3">
          <div className="text-xs text-slate-400">Total outward entries</div>
          <div className="text-2xl font-bold text-emerald-300">{outwardRecords.length}</div>
        </div>
      </div>

      <form onSubmit={save} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-xl sm:p-6">
        <div className="mb-5 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-emerald-300" /><h2 className="text-lg font-bold text-white">New Outward Entry</h2></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium text-slate-300">Inward Entry Number *</span>
            <select value={inwardNumber} onChange={(e) => setInwardNumber(e.target.value)} required className={fieldClass}>
              <option value="">Select / Enter inward entry number</option>
              {inwardRecords.map((record) => <option key={record.id} value={record.id}>{record.id} — {record.customerName} — {record.productName}{outwardRecords.some((out) => out.inwardRecordId === record.id) ? ' (Already Outward)' : ''}</option>)}
            </select>
            <span className="block text-xs text-slate-500">Choose the inward number; customer and product details will fill automatically.</span>
          </label>

          {selectedInward ? (
            <div className="sm:col-span-2 rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Inward Details Loaded</div>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div><div className="text-xs text-slate-400">Customer Name</div><div className="font-semibold text-white">{selectedInward.customerName}</div></div>
                <div><div className="text-xs text-slate-400">Phone Number</div><div className="font-semibold text-white">{selectedInward.phoneNumber}</div></div>
                <div><div className="text-xs text-slate-400">Product Name</div><div className="font-semibold text-white">{selectedInward.productName}</div></div>
                <div><div className="text-xs text-slate-400">Inward Date</div><div className="font-semibold text-white">{selectedInward.inwardDate}</div></div>
                <div className="sm:col-span-2"><div className="text-xs text-slate-400">Original Problem</div><div className="text-slate-200">{selectedInward.problem}</div></div>
                <div><div className="text-xs text-slate-400">Estimate Amount</div><div className="font-bold text-emerald-300">{money(selectedInward.estimateAmount)}</div></div>
              </div>
              {alreadyOutward && <p className="mt-3 text-sm font-semibold text-amber-300">This inward entry already has an outward record.</p>}
            </div>
          ) : (
            <div className="sm:col-span-2 rounded-xl border border-dashed border-slate-700 p-5 text-center text-sm text-slate-500">Select an inward entry number to display customer details here.</div>
          )}

          <label className="space-y-1.5"><span className="flex items-center gap-2 text-sm font-medium text-slate-300"><CalendarDays className="h-4 w-4" /> Out Date *</span><input type="date" value={outDate} onChange={(e) => setOutDate(e.target.value)} required className={fieldClass} /></label>
          <label className="space-y-1.5"><span className="flex items-center gap-2 text-sm font-medium text-slate-300"><IndianRupee className="h-4 w-4" /> Payment Method *</span><select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'UPI' | 'Cash')} className={fieldClass}><option value="UPI">UPI</option><option value="Cash">Cash</option></select></label>
          <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium text-slate-300">Problem Solution / Work Done *</span><textarea value={solution} onChange={(e) => setSolution(e.target.value)} required rows={3} placeholder="Write what was repaired or resolved..." className={fieldClass} /></label>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" onClick={resetForm} className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800">Clear</button><button type="submit" disabled={!selectedInward || alreadyOutward} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"><PackageCheck className="h-4 w-4" /> Save Outward</button></div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 p-4">
          <div><h2 className="font-bold text-white">Outward History</h2><p className="text-xs text-slate-400">{filtered.length} record(s)</p></div>
          <div className="relative min-w-[220px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inward no, name, phone..." className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-emerald-500" /></div>
        </div>
        {filtered.length === 0 ? <div className="p-10 text-center text-sm text-slate-400">No outward records yet. Select an inward entry above.</div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Inward No.</th><th className="px-4 py-3">Customer / Phone</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Out Date</th><th className="px-4 py-3">Solution</th><th className="px-4 py-3 text-right">Estimate</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-800">{filtered.map((record) => <tr key={record.id} className="text-slate-200 hover:bg-slate-800/40"><td className="px-4 py-3 font-semibold text-emerald-300">{record.inwardRecordId}</td><td className="px-4 py-3"><div className="font-semibold text-white">{record.customerName}</div><div className="text-xs text-slate-400">{record.phoneNumber}</div></td><td className="px-4 py-3">{record.productName}</td><td className="px-4 py-3 whitespace-nowrap">{record.outDate}</td><td className="max-w-xs px-4 py-3"><div className="line-clamp-2">{record.solution}</div></td><td className="px-4 py-3 text-right">{money(record.estimateAmount)}</td><td className="px-4 py-3">{record.paymentMethod}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => { if (window.confirm('Delete this outward record?')) onDeleteRecord(record.id); }} className="rounded-lg p-2 text-rose-300 hover:bg-rose-950/50" title="Delete outward record"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody>
          </table></div>
        )}
      </section>
    </div>
  );
};
