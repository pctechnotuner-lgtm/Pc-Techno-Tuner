import React, { useState } from 'react';
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
  Language,
} from '../types';
import { getT } from '../i18n';

interface CustomersViewProps {
  customers: Customer[];
  invoices: Invoice[];
  complaints: Complaint[];
  lang: Language;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onExportCsv: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  invoices,
  complaints,
  lang,
  onSaveCustomer,
  onDeleteCustomer,
  onExportCsv,
}) => {
  const t = getT(lang);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New / Edit Customer modal
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
      alert('Customer Name and Mobile are required.');
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

  const handleSendPaymentReminder = (c: Customer, dueAmount: number) => {
    const message = `Hello ${c.name},
Greetings from PC TECHNO TUNER, Ahmedabad.
This is a gentle reminder regarding your outstanding balance of ₹${dueAmount.toLocaleString('en-IN')}.
You can clear this via UPI (7383871195@okbizaxis) or bank transfer.

Thank you for your business!`;

    window.open(`https://wa.me/91${c.mobile}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Compute metrics per customer
  const customerMetrics = customers.map((c) => {
    const custInvoices = invoices.filter(
      (inv) => inv.customerMobile === c.mobile || inv.customerName.toLowerCase() === c.name.toLowerCase()
    );
    const totalBilled = custInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = custInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const outstanding = custInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

    const custComplaints = complaints.filter(
      (comp) => comp.mobile === c.mobile || comp.customerName.toLowerCase() === c.name.toLowerCase()
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
            <span>Customer Directory & Service History</span>
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
            <span>Add Customer</span>
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
            placeholder="Search customer by name, business, or mobile..."
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
                <th className="py-3 px-4">Customer / Firm</th>
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
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                filteredMetrics.map(({ customer, invoices: cInvs, complaints: cComps, totalBilled, totalPaid, outstanding }) => (
                  <tr key={customer.id} className="hover:bg-gray-800/40 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-white text-xs">{customer.name}</p>
                      {customer.businessName && (
                        <p className="text-[10px] text-blue-400 font-semibold">{customer.businessName}</p>
                      )}
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
                        href={`https://wa.me/91${customer.mobile}`}
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 my-8 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Customer Ledger & Service History</span>
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
              const custInvs = invoices.filter((i) => i.customerMobile === selectedCustomer.mobile);
              const custComps = complaints.filter((c) => c.mobile === selectedCustomer.mobile);
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

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 my-8 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Customer Full Name *</label>
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
                <label className="block text-gray-400 mb-1 font-semibold">Customer GSTIN (If registered)</label>
                <input
                  type="text"
                  value={formGstin}
                  onChange={(e) => setFormGstin(e.target.value.toUpperCase())}
                  placeholder="24AAAAA0000A1Z5"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                />
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
                <span>Save Customer</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
