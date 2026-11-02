import React, { useEffect, useState } from 'react';
import { getWhatsAppBusinessUrl, openWhatsAppBusiness } from '../lib/whatsapp';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageCircle,
  FileText,
  Wrench,
  Clock,
  Download,
  AlertCircle,
  X,
  Building,
  MapPin,
  Save,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import {
  Customer,
  Complaint,
  Invoice,
  Estimate,
  Transaction,
  AntivirusLicense,
  InwardRecord,
  OutwardRecord,
  Language,
} from '../types';
import { getT } from '../i18n';
import { sameParty } from '../lib/party';
import { supabase } from '../lib/supabaseClient';

interface CustomersViewProps {
  customers: Customer[];
  invoices: Invoice[];
  estimates: Estimate[];
  transactions: Transaction[];
  antivirusLicenses: AntivirusLicense[];
  complaints: Complaint[];
  inwardRecords: InwardRecord[];
  outwardRecords: OutwardRecord[];
  lang: Language;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onExportCsv: () => void;
}

interface QuoteLedgerRecord {
  id: string;
  customer_name: string;
  mobile: string;
  business_name?: string | null;
  items?: Array<{ name?: string; quantity?: number; unitPrice?: number | null; lineTotal?: number | null }>;
  subtotal?: number;
  status?: string;
  created_at?: string;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  invoices,
  estimates,
  transactions,
  antivirusLicenses,
  complaints,
  inwardRecords,
  outwardRecords,
  lang,
  onSaveCustomer,
  onDeleteCustomer,
  onExportCsv,
}) => {
  const t = getT(lang);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedLedgerEntry, setSelectedLedgerEntry] = useState<any | null>(null);
  const [quoteHistory, setQuoteHistory] = useState<QuoteLedgerRecord[]>([]);

  useEffect(() => {
    let active = true;
    void supabase.from('quote_requests').select('id,customer_name,mobile,business_name,items,subtotal,status,created_at').then(({ data, error }) => {
      if (!active) return;
      if (error) { console.error('Party quote history load failed:', error); return; }
      setQuoteHistory((data || []) as QuoteLedgerRecord[]);
    });
    return () => { active = false; };
  }, []);

  // New / Edit Party modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formName, setFormName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formBusiness, setFormBusiness] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formGstin, setFormGstin] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [addressResults, setAddressResults] = useState<any[]>([]);
  const [addressSearching, setAddressSearching] = useState(false);
  const searchCompanyAddress = async () => {
    if (!formBusiness.trim()) return;
    setAddressSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(formBusiness + ', India')}`);
      const results = await response.json();
      setAddressResults(Array.isArray(results) ? results : []);
      if (!results?.length) alert('Company address not found. Please enter it manually.');
    } catch { alert('Online address search failed. Please try again or enter manually.'); }
    finally { setAddressSearching(false); }
  };
  const chooseCompanyAddress = (place: any) => {
    const a = place.address || {};
    setFormAddress([place.name || a.amenity || a.office || a.shop || a.building, a.road, a.suburb || a.neighbourhood, a.city || a.town || a.village, a.state, a.postcode].filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i).join(', '));
    setAddressResults([]);
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormMobile('');
    setFormBusiness('');
    setFormEmail('');
    setFormAddress('');
    setFormGstin('');
    setFormNotes('');
    setModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormName(c.name);
    setFormMobile(c.mobile);
    setFormBusiness(c.businessName || '');
    setFormEmail(c.email || '');
    setFormAddress(c.address);
    setFormGstin(c.gstin || '');
    setFormNotes(c.notes || '');
    setModalOpen(true);
  };

  const handleBusinessNameChange = (value: string) => {
    setFormBusiness(value);
    const normalized = value.trim().toLocaleLowerCase();
    if (!normalized) return;

    const match = customers.find(
      (customer) => (customer.businessName || '').trim().toLocaleLowerCase() === normalized
    );

    if (match) {
      setFormName(match.name || '');
      setFormMobile(match.mobile || '');
      setFormEmail(match.email || '');
      setFormAddress(match.address || '');
      setFormGstin(match.gstin || '');
      setFormNotes(match.notes || '');
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMobile.trim()) {
      alert('Party Name and Mobile are required.');
      return;
    }

    const updated: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      name: formName.trim(),
      mobile: formMobile.trim(),
      businessName: formBusiness.trim() || undefined,
      email: formEmail.trim() || undefined,
      address: formAddress.trim(),
      gstin: formGstin.trim() || undefined,
      notes: formNotes.trim() || undefined,
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
    };

    onSaveCustomer(updated);
    setModalOpen(false);
  };

  const handleSendPaymentReminder = (c: Customer, _dueAmount: number) => openWhatsAppBusiness(c.mobile, 'Hello ' + c.name + ', this is a payment reminder from PC TECHNO TUNER regarding your outstanding balance of ₹' + _dueAmount.toLocaleString('en-IN') + '.');

  // Compute metrics per customer
  const customerMetrics = customers.map((c) => {
    const custInvoices = invoices.filter(
      (inv) => sameParty({ name: inv.customerName, mobile: inv.customerMobile }, c)
    );
    const totalBilled = custInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = custInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const outstanding = custInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

    const custComplaints = complaints.filter(
      (comp) => sameParty({ name: comp.customerName, mobile: comp.mobile }, c)
    );

    return {
      customer: c,
      invoices: custInvoices,
      complaints: custComplaints,
      totalBilled,
      totalPaid,
      outstanding,
    };
  });

  const filteredMetrics = customerMetrics.filter(({ customer }) => {
    const q = search.toLowerCase();
    return (
      customer.name.toLowerCase().includes(q) ||
      customer.mobile.includes(q) ||
      (customer.businessName && customer.businessName.toLowerCase().includes(q)) ||
      customer.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            <span>Party List & Details</span>
          </h1>
          <p className="text-xs text-gray-400">
            Track client hardware purchases, AMC history, past complaints, and ledger balance dues.
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
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Party</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search party by name, business, or mobile..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950 text-gray-400 uppercase font-bold border-b border-gray-800 tracking-wider">
              <tr>
                <th className="py-3 px-4">Party / Firm</th>
                <th className="py-3 px-4">Contact & Location</th>
                <th className="py-3 px-4">Total Billed</th>
                <th className="py-3 px-4">Total Paid</th>
                <th className="py-3 px-4">Outstanding Balance</th>
                <th className="py-3 px-4">History</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No parties found. Add your first party.
                  </td>
                </tr>
              ) : (
                filteredMetrics.map(({ customer, invoices: cInvs, complaints: cComps, totalBilled, totalPaid, outstanding }) => (
                  <tr key={customer.id} className="hover:bg-gray-800/40 transition">
                    <td className="py-3 px-4">
                      <button type="button" onClick={() => setSelectedCustomer(customer)} className="block text-left group">
                        <p className="font-bold text-white text-xs group-hover:text-cyan-300 underline decoration-dotted underline-offset-4 cursor-pointer">{customer.name}</p>
                        {customer.businessName && (
                          <p className="text-[10px] text-blue-400 font-semibold group-hover:text-cyan-300 underline decoration-dotted underline-offset-4 cursor-pointer">{customer.businessName}</p>
                        )}
                      </button>
                      {customer.gstin && (
                        <p className="text-[10px] text-gray-500 font-mono">GST: {customer.gstin}</p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-mono text-emerald-400 font-semibold">{customer.mobile}</p>
                      <p className="text-[10px] text-gray-400 line-clamp-1 max-w-xs">{customer.address || 'Ahmedabad'}</p>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-gray-300">
                      ₹{totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 font-mono font-black">
                      {outstanding > 0 ? (
                        <span className="text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                          ₹{outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-gray-500">Nil</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-gray-950 text-[10px] text-gray-300 border border-gray-800">
                          {cInvs.length} Invoices
                        </span>
                        <span className="px-2 py-0.5 rounded bg-gray-950 text-[10px] text-gray-300 border border-gray-800">
                          {cComps.length} Tickets
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded text-xs font-semibold transition"
                      >
                        Ledger History
                      </button>

                      <button
                        onClick={() => openEditModal(customer)}
                        className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          const hasHistory = cInvs.length > 0 || cComps.length > 0;
                          const message = hasHistory
                            ? `Delete party "${customer.name}" from Customers? Existing bills and complaints will be kept for history.`
                            : `Delete party "${customer.name}"?`;
                          if (window.confirm(message)) {
                            onDeleteCustomer(customer.id);
                            if (selectedCustomer?.id === customer.id) setSelectedCustomer(null);
                          }
                        }}
                        className="px-2 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded text-xs inline-flex items-center gap-1 transition"
                        title="Delete party"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>

                      <a
                        href={getWhatsAppBusinessUrl(customer.mobile)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 rounded text-xs inline-flex items-center transition"
                        title="Open WhatsApp chat"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Ledger History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] bg-gray-950 overflow-y-auto">
          <div className="min-h-screen w-full bg-gray-950 p-4 sm:p-6 lg:p-8 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Party Ledger & Service History</span>
                </h3>
                <p className="text-xs text-gray-400">
                  {selectedCustomer.name} • {selectedCustomer.mobile} {selectedCustomer.businessName && `(${selectedCustomer.businessName})`}
                </p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            {(() => {
              const matchesParty = (name?: string, mobile?: string) => sameParty({ name, mobile }, selectedCustomer);
              const custInvs = invoices.filter((i) => matchesParty(i.customerName, i.customerMobile));
              const custEstimates = estimates.filter((e) => matchesParty(e.customerName, e.customerMobile));
              const custQuotes = quoteHistory.filter((q) => matchesParty(q.customer_name, q.mobile));
              const custComps = complaints.filter((c) => matchesParty(c.customerName, c.mobile));
              const custInwards = inwardRecords.filter((r) => matchesParty(r.customerName, r.phoneNumber));
              const custOutwards = outwardRecords.filter((r) => matchesParty(r.customerName, r.phoneNumber));
              const custTransactions = transactions.filter((tx) => matchesParty(tx.partyName));
              const custAntivirus = antivirusLicenses.filter((license) => matchesParty(license.customerName, license.mobile));
              const totalBilled = custInvs.reduce((s, i) => s + i.totalAmount, 0);
              const totalPaid = custInvs.reduce((s, i) => s + i.amountPaid, 0);
              const due = custInvs.reduce((s, i) => s + i.balanceDue, 0);

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 bg-gray-950 p-3 rounded-xl border border-gray-800 text-center">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Total Billed</span>
                      <span className="text-sm font-bold text-white font-mono">₹{totalBilled.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Total Paid</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">₹{totalPaid.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Outstanding Due</span>
                      <span className={`text-sm font-bold font-mono ${due > 0 ? 'text-rose-400' : 'text-gray-400'}`}>
                        ₹{due.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {due > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs">
                      <span className="text-rose-300">Customer has an outstanding balance of ₹{due.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => handleSendPaymentReminder(selectedCustomer, due)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Send Payment Reminder</span>
                      </button>
                    </div>
                  )}

                  {/* Unified date-wise party statement */}
                  {(() => {
                    const rows: Array<{ key: string; date?: string; type: string; ref: string; work: string; amount: number; paid: number; due: number; status?: string; detail: Array<{ name?: string; description?: string; value?: string; qty?: number; rate?: number; total?: number }> }> = [
                      ...custInvs.map((x) => ({ key: 'inv-' + x.id, date: x.invoiceDate, type: 'Invoice', ref: x.invoiceNo, work: x.items.map(i => i.description + ' × ' + i.quantity).join(', '), amount: Number(x.totalAmount || 0), paid: Number(x.amountPaid || 0), due: Number(x.balanceDue || 0), status: x.paymentStatus, detail: x.items.map(i => ({ name: i.description, qty: i.quantity, rate: i.unitPrice, total: i.lineTotal })) })),
                      ...custEstimates.map((x) => ({ key: 'est-' + x.id, date: x.estimateDate, type: 'Estimate', ref: x.estimateNo, work: x.items.map(i => i.description + ' × ' + i.quantity).join(', '), amount: Number(x.totalAmount || 0), paid: 0, due: 0, status: 'Estimate', detail: x.items.map(i => ({ name: i.description, qty: i.quantity, rate: i.unitPrice, total: i.lineTotal })) })),
                      ...custInwards.map((x) => ({ key: 'in-' + x.id, date: x.inwardDate, type: 'Inward', ref: x.id, work: x.productName, amount: Number(x.estimateAmount || 0), paid: 0, due: 0, status: 'Received for service', detail: [{ name: 'Problem', value: x.problem }] })),
                      ...custOutwards.map((x) => ({ key: 'out-' + x.id, date: x.outDate, type: 'Outward', ref: x.inwardRecordId, work: x.productName, amount: Number(x.amountCollected || 0), paid: Number(x.amountCollected || 0), due: 0, status: 'Delivered', detail: [{ name: 'Solution', value: x.solution }, { name: 'Payment', value: x.paymentMethod }] })),
                      ...custComps.map((x) => ({ key: 'comp-' + x.id, date: x.createdAt?.slice(0,10), type: 'Complaint', ref: x.id, work: x.category + ' • ' + x.complaintType, amount: Number(x.serviceCharges || 0), paid: 0, due: 0, status: x.status, detail: [{ name: 'Description', value: x.description }, { name: 'Service location', value: x.serviceLocation }] })),
                      ...custTransactions.map((x) => ({ key: 'tx-' + x.id, date: x.date, type: x.type === 'INCOME' ? 'Payment received' : 'Payment / Expense', ref: x.referenceId || x.id, work: x.category, amount: Number(x.amount || 0), paid: x.type === 'INCOME' ? Number(x.amount || 0) : 0, due: 0, status: x.paymentMethod, detail: [{ name: 'Notes', value: x.notes || '—' }] })),
                      ...custAntivirus.map((x) => ({ key: 'av-' + x.id, date: x.purchaseDate, type: 'Antivirus', ref: x.id, work: x.antivirusCompany, amount: 0, paid: 0, due: 0, status: 'Expiry: ' + x.expiryDate, detail: [{ name: 'License key', value: x.licenseKey }] })),
                      ...custQuotes.map((x) => ({ key: 'quote-' + x.id, date: x.created_at?.slice(0,10), type: 'Quote request', ref: x.id, work: (x.items || []).map(i => i.name + ' × ' + (i.quantity || 1)).join(', ') || x.customer_name, amount: Number(x.subtotal || 0), paid: 0, due: 0, status: x.status || 'New', detail: (x.items || []).map(i => ({ name: i.name, qty: i.quantity, rate: Number(i.unitPrice || 0), total: Number(i.lineTotal || 0) })) })),
                    ].sort((a,b) => (b.date || '').localeCompare(a.date || ''));
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2"><h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">Complete Party Ledger — Date Wise</h4><span className="text-[10px] text-gray-400">{rows.length} entries</span></div>
                        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950">
                          <table className="w-full min-w-[760px] text-left text-[11px]">
                            <thead className="bg-gray-900 text-gray-400"><tr><th className="p-2">Date</th><th className="p-2">Work / Product</th><th className="p-2">Type / ID</th><th className="p-2 text-right">Amount</th><th className="p-2 text-right">Received</th><th className="p-2 text-right">Balance</th><th className="p-2">Status / Details</th></tr></thead>
                            <tbody className="divide-y divide-gray-800">
                              {rows.length === 0 ? <tr><td colSpan={7} className="p-5 text-center text-gray-500">No activity found for this party.</td></tr> : rows.map((r) => (
                                <tr key={r.key} className="align-top hover:bg-gray-900/70">
                                  <td className="p-2 whitespace-nowrap text-gray-300">{r.date || '—'}</td>
                                  <td className="p-2 min-w-[180px]"><div className="font-semibold text-white">{r.work || '—'}</div></td>
                                  <td className="p-2 whitespace-nowrap"><div className="font-semibold text-cyan-300">{r.type}</div><div className="font-mono text-[10px] text-gray-500">{r.ref}</div></td>
                                  <td className="p-2 text-right whitespace-nowrap text-white">₹{r.amount.toLocaleString('en-IN')}</td>
                                  <td className="p-2 text-right whitespace-nowrap text-emerald-300">₹{r.paid.toLocaleString('en-IN')}</td>
                                  <td className="p-2 text-right whitespace-nowrap text-rose-300">₹{r.due.toLocaleString('en-IN')}</td>
                                  <td className="p-2 min-w-[120px]"><div className="text-gray-300">{r.status || '—'}</div><button type="button" onClick={() => setSelectedLedgerEntry(r)} className="mt-2 inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20">Open details ↗</button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-[10px] text-gray-500">Invoice balance is shown as due. Estimate and inward amounts are not counted as outstanding until an invoice is made. Payment entries are shown separately to avoid double counting.</p>
{selectedLedgerEntry && (
                          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm" onClick={() => setSelectedLedgerEntry(null)}>
                            <section className="party-ledger-print w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-cyan-500/30 bg-gray-950 text-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="ledger-entry-title" onClick={(event) => event.stopPropagation()}>
                              <header className="flex items-start justify-between gap-3 border-b border-gray-800 bg-gray-900 p-5">
                                <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">PC TECHNO TUNER • Party Service Record</p><h3 id="ledger-entry-title" className="mt-1 text-xl font-black">{selectedLedgerEntry.work || 'Party Record'}</h3><p className="mt-1 text-sm text-gray-400">{selectedCustomer.name} • {selectedCustomer.mobile}</p></div>
                                <button type="button" onClick={() => setSelectedLedgerEntry(null)} aria-label="Close details" className="rounded-lg border border-gray-700 p-2 text-gray-300 hover:bg-gray-800"><X className="h-5 w-5"/></button>
                              </header>
                              <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
                                {[['Date', selectedLedgerEntry.date || '—'], ['Type', selectedLedgerEntry.type], ['Reference / ID', selectedLedgerEntry.ref || '—'], ['Status', selectedLedgerEntry.status || '—']].map(([label,value]) => <div key={label} className="rounded-xl border border-gray-800 bg-gray-900 p-3"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 break-words text-sm font-bold text-white">{value}</p></div>)}
                              </div>
                              <div className="space-y-3 px-5 pb-5">
                                <div className="rounded-xl border border-gray-800 p-4"><h4 className="mb-3 text-sm font-bold text-cyan-300">Work / Product Details</h4><p className="text-sm text-white">{selectedLedgerEntry.work || '—'}</p>
                                  {selectedLedgerEntry.detail?.length ? <div className="mt-3 divide-y divide-gray-800">{selectedLedgerEntry.detail.map((d: any,index: number) => <div key={index} className="flex flex-wrap justify-between gap-2 py-2 text-sm"><span className="font-semibold text-gray-300">{d.name || d.description || 'Details'}</span><span className="max-w-full break-words text-right text-gray-100">{d.value ?? (d.qty ? d.qty + ' × ₹' + Number(d.rate || 0).toLocaleString('en-IN') + ' = ₹' + Number(d.total || 0).toLocaleString('en-IN') : d.name || '—')}</span></div>)}</div> : <p className="text-sm text-gray-400">No extra details recorded.</p>}
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  {[['Amount',selectedLedgerEntry.amount],['Received',selectedLedgerEntry.paid],['Balance',selectedLedgerEntry.due]].map(([label,value]: any) => <div key={label} className="rounded-xl border border-gray-800 bg-gray-900 p-3"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 text-base font-black">₹{Number(value || 0).toLocaleString('en-IN')}</p></div>)}
                                </div>
                              </div>
                              <footer className="flex flex-wrap justify-end gap-2 border-t border-gray-800 p-4">
                                <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-gray-950 hover:bg-cyan-400"><Download className="h-4 w-4"/> Print / Save PDF</button>
                                <button type="button" onClick={() => setSelectedLedgerEntry(null)} className="rounded-xl border border-gray-700 px-5 py-3 text-sm font-bold text-white hover:bg-gray-800">Close</button>
                              </footer>
                            </section>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Past Invoices */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>Invoices Issued ({custInvs.length})</span>
                    </h4>
                    {custInvs.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No invoices recorded yet.</p>
                    ) : (
                      <div className="divide-y divide-gray-800 border border-gray-800 rounded-xl overflow-hidden bg-gray-950">
                        {custInvs.map((inv) => (
                          <div key={inv.id} className="p-3 text-xs flex items-center justify-between">
                            <div>
                              <p className="font-mono font-bold text-blue-400">{inv.invoiceNo}</p>
                              <p className="text-[10px] text-gray-500">Date: {inv.invoiceDate}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-bold text-white">₹{inv.totalAmount.toLocaleString('en-IN')}</p>
                              <p className="text-[10px] text-emerald-400">Paid: ₹{inv.amountPaid.toLocaleString('en-IN')} (Due: ₹{inv.balanceDue})</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Estimate history */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Estimates / Quotations ({custEstimates.length})</h4>
                    {custEstimates.length === 0 ? <p className="text-xs italic text-gray-500">No estimates recorded.</p> : <div className="divide-y divide-gray-800 border border-gray-800 rounded-xl overflow-hidden bg-gray-950">{custEstimates.map((e) => <div key={e.id} className="p-3 text-xs flex items-center justify-between gap-3"><div><p className="font-mono font-bold text-cyan-300">{e.estimateNo}</p><p className="text-[10px] text-gray-500">Date: {e.estimateDate} • Valid until: {e.validUntil}</p></div><div className="text-right"><p className="font-bold text-white">₹{Number(e.totalAmount||0).toLocaleString('en-IN')}</p><p className="text-[10px] text-gray-500">{e.items?.length||0} item(s)</p></div></div>)}</div>}
                  </div>

                  {/* Customer quote request history */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Quote Requests ({custQuotes.length})</h4>
                    {custQuotes.length === 0 ? <p className="text-xs italic text-gray-500">No customer quote requests recorded.</p> : <div className="divide-y divide-gray-800 border border-gray-800 rounded-xl overflow-hidden bg-gray-950">{custQuotes.map((q) => <div key={q.id} className="p-3 text-xs flex items-center justify-between gap-3"><div><p className="font-mono font-bold text-cyan-300">{q.id}</p><p className="text-[10px] text-gray-500">{q.created_at ? new Date(q.created_at).toLocaleString('en-IN') : ''} • {q.status || 'New'}</p><p className="text-gray-300">{(q.items||[]).map(item=>item.name+' × '+(item.quantity||1)).join(', ')}</p></div><div className="text-right font-bold text-white">₹{Number(q.subtotal||0).toLocaleString('en-IN')}</div></div>)}</div>}
                  </div>

                  {/* Accounts transactions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Payments / Account Entries ({custTransactions.length})</h4>
                    {custTransactions.length === 0 ? <p className="text-xs italic text-gray-500">No account entries recorded.</p> : <div className="max-h-56 overflow-y-auto divide-y divide-gray-800 rounded-xl border border-gray-800 bg-gray-950">{custTransactions.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map((tx)=><div key={tx.id} className="p-3 text-xs flex items-center justify-between gap-3"><div><p className="font-semibold text-white">{tx.category}</p><p className="text-[10px] text-gray-500">{tx.date} • {tx.referenceId||'No reference'} • {tx.paymentMethod}</p></div><div className={tx.type==='INCOME'?'text-right font-bold text-emerald-300':'text-right font-bold text-rose-300'}>{tx.type==='INCOME'?'+':'−'}₹{Number(tx.amount||0).toLocaleString('en-IN')}</div></div>)}</div>}
                  </div>

                  {/* Antivirus licence history */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Antivirus Licenses ({custAntivirus.length})</h4>
                    {custAntivirus.length === 0 ? <p className="text-xs italic text-gray-500">No antivirus licenses recorded.</p> : <div className="divide-y divide-gray-800 rounded-xl border border-gray-800 bg-gray-950">{custAntivirus.map((license)=><div key={license.id} className="p-3 text-xs flex items-center justify-between gap-3"><div><p className="font-semibold text-white">{license.antivirusCompany}</p><p className="text-[10px] text-gray-500">Purchase: {license.purchaseDate} • Expiry: {license.expiryDate}</p></div><span className="font-mono text-cyan-300">{license.licenseKey}</span></div>)}</div>}
                  </div>

                  {/* Inward and outward service history for this party */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <section className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">Inward Records ({custInwards.length})</h4>
                      {custInwards.length === 0 ? <p className="text-xs italic text-gray-500">No inward records.</p> : (
                        <div className="max-h-56 divide-y divide-gray-800 overflow-y-auto rounded-xl border border-gray-800 bg-gray-950">
                          {custInwards.slice().sort((a,b) => (b.inwardDate || '').localeCompare(a.inwardDate || '')).map((r) => (
                            <div key={r.id} className="p-3 text-xs">
                              <div className="flex justify-between gap-2"><span className="font-mono font-bold text-amber-300">{r.id}</span><span className="text-gray-500">{r.inwardDate}</span></div>
                              <p className="mt-1 font-semibold text-white">{r.productName}</p>
                              <p className="text-gray-400">{r.problem}</p>
                              <p className="mt-1 text-amber-300">Estimate: ₹{Number(r.estimateAmount || 0).toLocaleString('en-IN')}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                    <section className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">Outward Records ({custOutwards.length})</h4>
                      {custOutwards.length === 0 ? <p className="text-xs italic text-gray-500">No outward records.</p> : (
                        <div className="max-h-56 divide-y divide-gray-800 overflow-y-auto rounded-xl border border-gray-800 bg-gray-950">
                          {custOutwards.slice().sort((a,b) => (b.outDate || '').localeCompare(a.outDate || '')).map((r) => (
                            <div key={r.id} className="p-3 text-xs">
                              <div className="flex justify-between gap-2"><span className="font-mono font-bold text-emerald-300">{r.inwardRecordId}</span><span className="text-gray-500">{r.outDate}</span></div>
                              <p className="mt-1 font-semibold text-white">{r.productName}</p>
                              <p className="text-gray-400">{r.solution}</p>
                              <p className="mt-1 text-emerald-300">Collected: ₹{Number(r.amountCollected || 0).toLocaleString('en-IN')}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>

                  {/* Past Service Complaints */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-400" />
                      <span>Complaints & Service Tickets ({custComps.length})</span>
                    </h4>
                    {custComps.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No service complaints registered.</p>
                    ) : (
                      <div className="divide-y divide-gray-800 border border-gray-800 rounded-xl overflow-hidden bg-gray-950">
                        {custComps.map((comp) => (
                          <div key={comp.id} className="p-3 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-mono font-bold text-blue-400">{comp.id}</span>
                              <span className="ml-2 text-gray-400">{comp.category} ({comp.complaintType})</span>
                              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{comp.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-300">
                                {comp.status}
                              </span>
                              {comp.serviceCharges > 0 && (
                                <p className="text-[10px] text-gray-400 mt-1 font-mono">Charge: ₹{comp.serviceCharges}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Add / Edit Party Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 my-8 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{editingCustomer ? 'Edit Party' : 'Add New Party'}</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Party GSTIN (If registered)</label>
                <input
                  type="text"
                  value={formGstin}
                  onChange={(e) => setFormGstin(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15))}
                  maxLength={15}
                  placeholder="24AAAAA0000A1Z5"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => window.open('https://services.gst.gov.in/services/searchtp', '_blank', 'noopener,noreferrer')}
                  className="mt-2 w-full rounded-xl border border-emerald-700 bg-emerald-950/60 px-3 py-2 text-emerald-300 font-bold hover:bg-emerald-900"
                >
                  Verify GSTIN on Official GST Portal
                </button>
                <p className="text-[10px] text-gray-500 mt-1">GST portal par GSTIN enter karke CAPTCHA complete karein. Verified legal name/address ko yahan copy karke save karein.</p>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Party Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Nilesh Shah"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={formMobile}
                  onChange={(e) => setFormMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10 digit phone number"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Company / Firm Name (Optional)</label>
                <input
                  type="text"
                  value={formBusiness}
                  onChange={(e) => handleBusinessNameChange(e.target.value)}
                  placeholder="e.g. Shah Trading Co."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Email (Optional)</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="client@gmail.com"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Company Address</label>
                <div className="flex gap-2">
                  <input type="text" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="Company address" className="min-w-0 flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  <button type="button" onClick={searchCompanyAddress} disabled={addressSearching || !formBusiness.trim()} className="shrink-0 px-3 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50">{addressSearching ? 'Searching…' : 'Search Online'}</button>
                </div>
                {addressResults.length > 0 && <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-700 bg-gray-950">{addressResults.map((place: any) => <button type="button" key={place.place_id} onClick={() => chooseCompanyAddress(place)} className="block w-full text-left p-2 text-xs text-gray-200 border-b border-gray-800 hover:bg-gray-800">{place.display_name}</button>)}</div>}
                <p className="text-[10px] text-gray-500 mt-1">Search company name online, then select the correct match. Verify the address before saving.</p>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Internal Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Notes about client requirements or AMC schedule..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Party</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
