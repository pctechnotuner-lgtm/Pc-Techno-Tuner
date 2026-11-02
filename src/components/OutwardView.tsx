import React, { useMemo, useState } from 'react';
import { PackageCheck, Search, Trash2, CalendarDays, IndianRupee, ClipboardList, CheckCircle2, MessageCircle, Pencil } from 'lucide-react';
import { InwardRecord, OutwardRecord } from '../types';
import { openWhatsAppBusiness } from '../lib/whatsapp';

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
  const [amountCollected, setAmountCollected] = useState('');
  const [settlementApplied, setSettlementApplied] = useState(false);
  const [settlementNote, setSettlementNote] = useState('');
  const [deliveryBy, setDeliveryBy] = useState<'Porter' | 'Engineer'>('Engineer');
  const [porterName, setPorterName] = useState('');
  const [porterPhoneNumber, setPorterPhoneNumber] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewOutwardRecord, setViewOutwardRecord] = useState<OutwardRecord | null>(null);
  const [viewPendingInward, setViewPendingInward] = useState<InwardRecord | null>(null);

  const selectedInward = useMemo(
    () => inwardRecords.find((record) => record.id === inwardNumber),
    [inwardRecords, inwardNumber]
  );
  const alreadyOutward = outwardRecords.some((record) => record.inwardRecordId === inwardNumber && record.id !== editingId);
  const pendingInwardRecords = inwardRecords.filter((record) => !outwardRecords.some((outward) => outward.inwardRecordId === record.id));
  const chooseInwardForOutward = (record: InwardRecord) => {
    setInwardNumber(record.id);
    setShowForm(true);
    setEditingId(null);
    setOutDate(today());
    setSolution('');
    setPaymentMethod('UPI');
    setAmountCollected('');
    setSettlementApplied(false);
    setSettlementNote('');
    setDeliveryBy('Engineer');
    setPorterName('');
    setPorterPhoneNumber('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setInwardNumber('');
    setOutDate(today());
    setSolution('');
    setPaymentMethod('UPI');
    setAmountCollected('');
    setDeliveryBy('Engineer');
    setPorterName('');
    setPorterPhoneNumber('');
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedInward) {
      alert('Please select a valid Inward Entry Number.');
      return;
    }
    if (deliveryBy === 'Porter' && (!porterName.trim() || !porterPhoneNumber.trim())) {
      alert('Please enter Porter name and phone number.');
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
    if (editingId && !window.confirm('Update this outward entry?')) return;
    const existingRecord = editingId ? outwardRecords.find((item) => item.id === editingId) : undefined;
    const record: OutwardRecord = {
      id: editingId || 'OUT-' + Date.now(),
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
      amountCollected: Number(amountCollected) || 0,
      settlementApplied,
      settlementNote: settlementApplied ? settlementNote.trim() : '',
      deliveryBy,
      porterName: deliveryBy === 'Porter' ? porterName.trim() : '',
      porterPhoneNumber: deliveryBy === 'Porter' ? porterPhoneNumber.trim() : '',
      createdAt: existingRecord?.createdAt || new Date().toISOString(),
    };
    onSaveRecord(record);
    resetForm();
    alert(editingId ? 'Outward entry updated successfully.' : 'Outward entry saved successfully.');
  };

  const startEdit = (record: OutwardRecord) => {
    setEditingId(record.id);
    setShowForm(true);
    setInwardNumber(record.inwardRecordId);
    setOutDate(record.outDate);
    setSolution(record.solution);
    setPaymentMethod(record.paymentMethod);
    setAmountCollected(String(record.amountCollected ?? 0));
    setSettlementApplied(Boolean(record.settlementApplied));
    setSettlementNote(record.settlementNote || '');
    setDeliveryBy(record.deliveryBy || 'Engineer');
    setPorterName(record.porterName || '');
    setPorterPhoneNumber(record.porterPhoneNumber || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sendOutwardWhatsApp = (record: OutwardRecord) => openWhatsAppBusiness(record.phoneNumber, 'PC TECHNO TUNER - Delivery Update\\nItem ID: ' + record.inwardRecordId + '\\nCustomer: ' + record.customerName + '\\nProduct: ' + record.productName + '\\nOut Date: ' + record.outDate + '\\nWork Done: ' + record.solution + '\\nDelivery By: ' + (record.deliveryBy || 'Engineer') + '\\nPayment: ' + record.paymentMethod + '\\nAmount Collected: ₹' + (record.amountCollected || 0));

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

      <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
        <div className="mb-2"><h2 className="font-bold text-white">Search Outward History</h2><p className="text-xs text-slate-400">{filtered.length} record(s)</p></div>
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inward no, name, phone, product..." className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-9 pr-3 text-sm text-white outline-none focus:border-emerald-500" /></div>
      </section>

      <div className="flex justify-end"><button type="button" onClick={() => { setShowForm((value) => !value); if (showForm) resetForm(); }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500"><PackageCheck className="h-4 w-4" /> {showForm ? 'Close Form' : 'New Outward Entry'}</button></div>

      {showForm && <form onSubmit={save} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-xl sm:p-6">
        <div className="mb-5 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-emerald-300" /><h2 className="text-lg font-bold text-white">{editingId ? `Edit Outward Entry — ${inwardNumber}` : 'New Outward Entry'}</h2></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium text-slate-300">Search Inward Item *</span>
            <input
              list="available-inward-numbers"
              value={inwardNumber}
              onChange={(e) => {
                const value = e.target.value;
                const matched = inwardRecords.find((record) =>
                  [record.id, record.customerName, record.phoneNumber, record.productName]
                    .some((field) => field.toLowerCase().includes(value.trim().toLowerCase()))
                );
                setInwardNumber(matched ? matched.id : value.trim());
              }}
              required
              placeholder="Type PTT01, customer name, mobile or product..."
              className={fieldClass}
            />
            <datalist id="available-inward-numbers">
              {inwardRecords.map((record) => <option key={record.id} value={record.id}>{record.customerName} — {record.phoneNumber} — {record.productName}</option>)}
              {inwardRecords.map((record) => <option key={record.id + '-name'} value={record.customerName}>{record.id} — {record.phoneNumber} — {record.productName}</option>)}
              {inwardRecords.map((record) => <option key={record.id + '-phone'} value={record.phoneNumber}>{record.id} — {record.customerName} — {record.productName}</option>)}
              {inwardRecords.map((record) => <option key={record.id + '-product'} value={record.productName}>{record.id} — {record.customerName} — {record.phoneNumber}</option>)}
            </datalist>
            <span className="block text-xs text-slate-500">Search by item number, party name, mobile number or product. Select a suggestion to load details.</span>
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
          <label className="space-y-1.5"><span className="flex items-center gap-2 text-sm font-medium text-slate-300"><IndianRupee className="h-4 w-4" /> Amount Collected (₹) *</span><input type="number" min="0" step="0.01" value={amountCollected} onChange={(e) => setAmountCollected(e.target.value)} required placeholder="Enter amount collected" className={fieldClass} /></label>
          {selectedInward && Number(amountCollected || 0) < Number(selectedInward.estimateAmount || 0) && (
            <div className="sm:col-span-2 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
              <div className="flex items-start gap-3">
                <input id="settlement-applied" type="checkbox" checked={settlementApplied} onChange={(e) => setSettlementApplied(e.target.checked)} className="mt-1 h-5 w-5 accent-emerald-500" />
                <label htmlFor="settlement-applied" className="cursor-pointer">
                  <span className="block text-sm font-bold text-amber-200">Settle / Close Remaining Balance</span>
                  <span className="mt-1 block text-xs text-slate-300">Remaining amount: {money(Math.max(0, Number(selectedInward.estimateAmount || 0) - Number(amountCollected || 0)))}. Tick this if you are waiving the balance / giving discount and want the party due to become ₹0.</span>
                </label>
              </div>
              {settlementApplied && <div className="mt-3 space-y-1.5"><label className="text-xs font-semibold text-slate-300" htmlFor="settlement-note">Settlement note (optional)</label><input id="settlement-note" value={settlementNote} onChange={(e) => setSettlementNote(e.target.value)} placeholder="e.g. Discount / goodwill / final settlement" className={fieldClass}/><p className="text-xs font-bold text-emerald-300">After settlement, party outstanding for this service will be ₹0.</p></div>}
            </div>
          )}
          <label className="space-y-1.5"><span className="text-sm font-medium text-slate-300">Delivery By *</span><select value={deliveryBy} onChange={(e) => setDeliveryBy(e.target.value as 'Porter' | 'Engineer')} className={fieldClass}><option value="Engineer">Engineer</option><option value="Porter">Porter</option></select></label>
          {deliveryBy === 'Porter' && <>
            <label className="space-y-1.5"><span className="text-sm font-medium text-slate-300">Porter Name *</span><input value={porterName} onChange={(e) => setPorterName(e.target.value)} required placeholder="Enter porter name" className={fieldClass} /></label>
            <label className="space-y-1.5"><span className="text-sm font-medium text-slate-300">Porter Phone Number *</span><input type="tel" inputMode="tel" value={porterPhoneNumber} onChange={(e) => setPorterPhoneNumber(e.target.value)} required placeholder="Enter porter phone number" className={fieldClass} /></label>
          </>}
          <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium text-slate-300">Problem Solution / Work Done *</span><textarea value={solution} onChange={(e) => setSolution(e.target.value)} required rows={3} placeholder="Write what was repaired or resolved..." className={fieldClass} /></label>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" onClick={resetForm} className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800">{editingId ? 'Cancel Edit' : 'Clear'}</button><button type="submit" disabled={!selectedInward || alreadyOutward} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"><PackageCheck className="h-4 w-4" /> {editingId ? 'Update Outward' : 'Save Outward'}</button></div>
      </form>}

      {viewPendingInward && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setViewPendingInward(null)}>
        <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl border border-emerald-500/30 bg-slate-900 p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold text-white">Inward Details</h2><p className="text-sm font-semibold text-emerald-300">{viewPendingInward.id}</p></div><button type="button" onClick={() => setViewPendingInward(null)} className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800">Close</button></div>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div><div className="text-xs text-slate-400">Customer</div><div className="font-semibold text-white">{viewPendingInward.customerName}</div></div>
            <div><div className="text-xs text-slate-400">Phone</div><div className="font-semibold text-white">{viewPendingInward.phoneNumber}</div></div>
            <div><div className="text-xs text-slate-400">Product</div><div className="font-semibold text-white">{viewPendingInward.productName}</div></div>
            <div><div className="text-xs text-slate-400">Inward Date</div><div className="font-semibold text-white">{viewPendingInward.inwardDate}</div></div>
            <div className="sm:col-span-2"><div className="text-xs text-slate-400">Reported Problem</div><div className="text-white">{viewPendingInward.problem}</div></div>
            <div><div className="text-xs text-slate-400">Estimate</div><div className="font-bold text-emerald-300">{money(viewPendingInward.estimateAmount)}</div></div>
          </div>
          <div className="mt-5 flex justify-end"><button type="button" onClick={() => { const record = viewPendingInward; setViewPendingInward(null); chooseInwardForOutward(record); }} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Outward This Item</button></div>
        </div>
      </div>}
      {viewOutwardRecord && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setViewOutwardRecord(null)}>
        <div role="dialog" aria-modal="true" className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-emerald-500/30 bg-slate-900 p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold text-white">Outward Details</h2><p className="text-sm font-semibold text-emerald-300">{viewOutwardRecord.inwardRecordId}</p></div><button type="button" onClick={() => setViewOutwardRecord(null)} className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800">Close</button></div>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div><div className="text-xs text-slate-400">Customer</div><div className="font-semibold text-white">{viewOutwardRecord.customerName}</div></div>
            <div><div className="text-xs text-slate-400">Phone</div><div className="font-semibold text-white">{viewOutwardRecord.phoneNumber}</div></div>
            <div><div className="text-xs text-slate-400">Product</div><div className="font-semibold text-white">{viewOutwardRecord.productName}</div></div>
            <div><div className="text-xs text-slate-400">Inward Date</div><div className="font-semibold text-white">{viewOutwardRecord.inwardDate}</div></div>
            <div><div className="text-xs text-slate-400">Outward Date</div><div className="font-semibold text-white">{viewOutwardRecord.outDate}</div></div>
            <div><div className="text-xs text-slate-400">Delivery By</div><div className="font-semibold text-white">{viewOutwardRecord.deliveryBy || 'Engineer'}</div></div>
            {viewOutwardRecord.deliveryBy === 'Porter' && <><div><div className="text-xs text-slate-400">Porter Name</div><div className="font-semibold text-white">{viewOutwardRecord.porterName || '—'}</div></div><div><div className="text-xs text-slate-400">Porter Phone</div><div className="font-semibold text-white">{viewOutwardRecord.porterPhoneNumber || '—'}</div></div></>}
            <div className="sm:col-span-2"><div className="text-xs text-slate-400">Original Problem</div><div className="text-white">{viewOutwardRecord.inwardProblem}</div></div>
            <div className="sm:col-span-2"><div className="text-xs text-slate-400">Work Done / Solution</div><div className="text-white">{viewOutwardRecord.solution}</div></div>
            <div><div className="text-xs text-slate-400">Estimate</div><div className="font-bold text-emerald-300">{money(viewOutwardRecord.estimateAmount)}</div></div>
            <div><div className="text-xs text-slate-400">Amount Collected</div><div className="font-bold text-emerald-300">{money(viewOutwardRecord.amountCollected || 0)}</div></div>
            <div><div className="text-xs text-slate-400">Payment</div><div className="font-semibold text-white">{viewOutwardRecord.paymentMethod}</div></div>
          </div>
          <div className="mt-5 flex justify-end"><button type="button" onClick={() => { const record = viewOutwardRecord; setViewOutwardRecord(null); startEdit(record); }} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Edit Entry</button></div>
        </div>
      </div>}
      <section className="overflow-hidden rounded-2xl border border-emerald-500/25 bg-slate-900/70">
        <div className="border-b border-slate-700 p-4">
          <h2 className="font-bold text-white">Pending Inward Entries</h2>
          <p className="text-xs text-slate-400">{pendingInwardRecords.length} item(s) ready for outward</p>
        </div>
        {pendingInwardRecords.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">No pending inward entries. New inward items will appear here automatically.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {pendingInwardRecords.map((record) => (
              <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <button type="button" onClick={() => setViewPendingInward(record)} className="font-bold text-emerald-300 underline decoration-dotted underline-offset-4" title="View inward details">{record.id}</button>
                  <div className="text-sm font-semibold text-white">{record.customerName} · {record.productName}</div>
                  <div className="text-xs text-slate-400">{record.phoneNumber} · {record.inwardDate}</div>
                  <div className="mt-1 text-xs text-slate-400">Problem: {record.problem}</div>
                </div>
                <button type="button" onClick={() => chooseInwardForOutward(record)} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500">
                  <PackageCheck className="h-4 w-4" /> Outward This Item
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70">
        <div className="border-b border-slate-700 p-4"><h2 className="font-bold text-white">Outward History</h2><p className="text-xs text-slate-400">{filtered.length} record(s)</p></div>
        {filtered.length === 0 ? <div className="p-10 text-center text-sm text-slate-400">No outward records yet. Select an inward entry above.</div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Inward No.</th><th className="px-4 py-3">Customer / Phone</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Out Date</th><th className="px-4 py-3">Solution</th><th className="px-4 py-3 text-right">Estimate</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Delivery By</th><th className="px-4 py-3 text-right">Collected</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-800">{filtered.map((record) => <tr key={record.id} className="text-slate-200 hover:bg-slate-800/40"><td className="px-4 py-3"><button type="button" onClick={() => setViewOutwardRecord(record)} className="font-semibold text-emerald-300 underline decoration-dotted underline-offset-4" title="View outward details">{record.inwardRecordId}</button></td><td className="px-4 py-3"><div className="font-semibold text-white">{record.customerName}</div><div className="text-xs text-slate-400">{record.phoneNumber}</div></td><td className="px-4 py-3">{record.productName}</td><td className="px-4 py-3 whitespace-nowrap">{record.outDate}</td><td className="max-w-xs px-4 py-3"><div className="line-clamp-2">{record.solution}</div></td><td className="px-4 py-3 text-right">{money(record.estimateAmount)}</td><td className="px-4 py-3">{record.paymentMethod}</td><td className="px-4 py-3">{record.deliveryBy || 'Engineer'}</td><td className="px-4 py-3 text-right font-semibold text-emerald-300">{money(record.amountCollected || 0)}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => startEdit(record)} className="rounded-lg p-2 text-emerald-300 hover:bg-emerald-950/50" title="Edit outward record"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => sendOutwardWhatsApp(record)} className="rounded-lg p-2 text-green-300 hover:bg-green-950/50" title="Send outward details on WhatsApp"><MessageCircle className="h-4 w-4" /></button><button type="button" onClick={() => { if (window.confirm('Delete this outward record?')) onDeleteRecord(record.id); }} className="rounded-lg p-2 text-rose-300 hover:bg-rose-950/50" title="Delete outward record"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody>
          </table></div>
        )}
      </section>
    </div>
  );
};
