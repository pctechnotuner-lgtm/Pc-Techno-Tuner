import React, { useState } from 'react';
import {
  AlertCircle,
  Search,
  Filter,
  MessageCircle,
  Wrench,
  Clock,
  Calendar,
  CheckCircle,
  X,
  User,
  Phone,
  MapPin,
  Save,
  Download,
  DollarSign,
  FileText,
  Trash2,
} from 'lucide-react';
import {
  Complaint,
  ComplaintStatus,
  CompanyProfile,
  Language,
  ProductCategory,
  PRODUCT_CATEGORIES,
} from '../types';
import { getT } from '../i18n';

interface ComplaintsAdminViewProps {
  complaints: Complaint[];
  profile: CompanyProfile;
  lang: Language;
  onUpdateComplaint: (complaint: Complaint) => void;
  onDeleteComplaint: (complaintId: string) => void;
  onExportCsv: () => void;
  selectedComplaintForEdit: Complaint | null;
  onClearSelectedComplaint: () => void;
}

export const ComplaintsAdminView: React.FC<ComplaintsAdminViewProps> = ({
  complaints,
  profile,
  lang,
  onUpdateComplaint,
  onDeleteComplaint,
  onExportCsv,
  selectedComplaintForEdit,
  onClearSelectedComplaint,
}) => {
  const t = getT(lang);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<string>('');

  // Active editing modal state
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(
    selectedComplaintForEdit
  );

  // Form Fields inside modal
  const [status, setStatus] = useState<ComplaintStatus>('New');
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [serviceCharges, setServiceCharges] = useState<number>(0);
  const [partsUsed, setPartsUsed] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // When selectedComplaintForEdit changes from parent
  React.useEffect(() => {
    if (selectedComplaintForEdit) {
      openEditModal(selectedComplaintForEdit);
    }
  }, [selectedComplaintForEdit]);

  const openEditModal = (c: Complaint) => {
    setEditingComplaint(c);
    setStatus(c.status);
    setAssignedTechnician(c.assignedTechnician || '');
    setVisitDate(c.visitDate || '');
    setServiceCharges(c.serviceCharges || 0);
    setPartsUsed(c.partsUsed || '');
    setInternalNotes(c.internalNotes || '');
  };

  const closeEditModal = () => {
    setEditingComplaint(null);
    onClearSelectedComplaint();
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;

    const updated: Complaint = {
      ...editingComplaint,
      status,
      assignedTechnician: assignedTechnician.trim() || undefined,
      visitDate: visitDate || undefined,
      serviceCharges: Number(serviceCharges) || 0,
      partsUsed: partsUsed.trim() || undefined,
      internalNotes: internalNotes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onUpdateComplaint(updated);
    closeEditModal();
  };

  const handleWhatsAppCustomer = (c: Complaint) => {
    const message = `Hello ${c.customerName},
This is regarding your service ticket with PC TECHNO TUNER:
Ticket ID: ${c.id}
Equipment: ${c.category} (${c.brandModel || 'General'})
Current Status: ${c.status}
${c.assignedTechnician ? `Assigned Engineer: ${c.assignedTechnician}` : ''}
${c.visitDate ? `Scheduled Visit Date: ${c.visitDate}` : ''}
${c.serviceCharges > 0 ? `Estimated Service Charges: ₹${c.serviceCharges}` : ''}

For any queries, please reply directly to this chat or call our Ahmedabad workshop at 7383871195.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/91${c.mobile}?text=${encoded}`, '_blank');
  };

  // Filter complaints
  const filtered = complaints.filter((c) => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesCategory = filterCategory === 'ALL' || c.category === filterCategory;
    const matchesDate = !filterDate || c.createdAt.startsWith(filterDate) || c.preferredDate === filterDate;
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search) ||
      (c.brandModel && c.brandModel.toLowerCase().includes(search.toLowerCase())) ||
      c.serviceLocation.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesCategory && matchesDate && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-500" />
            <span>Customer Complaints & Service Dispatch Desk</span>
          </h1>
          <p className="text-xs text-gray-400">
            Track customer problems, assign technicians, schedule visits, and update status on WhatsApp.
          </p>
        </div>

        <button
          onClick={onExportCsv}
          className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Complaints CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Ticket ID, Customer, Phone..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses ({complaints.length})</option>
            <option value="New">New</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Product Categories</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            title="Filter by ticket date"
          />
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950 text-gray-400 uppercase font-bold border-b border-gray-800 tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Customer & Location</th>
                <th className="py-3 px-4">Equipment & Issue</th>
                <th className="py-3 px-4">Warranty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Charge</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No complaints match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} onClick={() => openEditModal(c)} className="hover:bg-gray-800/40 transition cursor-pointer" title="Click to open full complaint details">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">
                      {c.id}
                      <span className="block text-[10px] text-gray-500 font-sans font-normal">
                        {new Date(c.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-white">{c.customerName}</p>
                      <p className="text-[11px] text-emerald-400 font-mono">{c.mobile}</p>
                      {c.businessName && (
                        <p className="text-[10px] text-gray-400">{c.businessName}</p>
                      )}
                      <p className="text-[10px] text-gray-500 line-clamp-1 max-w-xs">{c.serviceLocation}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-gray-950 text-[10px] text-gray-300 border border-gray-800 font-medium">
                        {c.category}
                      </span>
                      <p className="font-semibold text-gray-200 mt-1">{c.complaintType}</p>
                      <p className="text-[10px] text-gray-400 line-clamp-1 max-w-xs">{c.description}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.warrantyStatus === 'Under Warranty'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {c.warrantyStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : c.status === 'In Progress'
                            ? 'bg-purple-950 text-purple-400 border border-purple-800'
                            : c.status === 'New'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-gray-300">
                      {c.assignedTechnician ? (
                        <div>
                          <p className="font-medium text-white">{c.assignedTechnician}</p>
                          {c.visitDate && (
                            <p className="text-[10px] text-gray-500">Visit: {c.visitDate}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-600 italic">Not Assigned</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-white">
                      ₹{c.serviceCharges}
                    </td>

                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete complaint ticket ${c.id} for ${c.customerName}? This will also remove its linked service-charge transaction.`)) {
                            onDeleteComplaint(c.id);
                            if (editingComplaint?.id === c.id) closeEditModal();
                          }
                        }}
                        className="px-2 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded text-xs font-semibold inline-flex items-center gap-1 transition"
                        title="Delete complaint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleWhatsAppCustomer(c); }}
                        className="p-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 rounded text-xs inline-flex items-center transition"
                        title="Send update to customer on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Management Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 my-8 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-400" />
                  <span>Manage Ticket: {editingComplaint.id}</span>
                </h3>
                <p className="text-xs text-gray-400">
                  {editingComplaint.customerName} • {editingComplaint.mobile}
                </p>
              </div>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read-only Ticket Brief */}
            <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800 text-xs space-y-1.5 text-gray-300">
              <p>
                <strong className="text-gray-400">Equipment:</strong> {editingComplaint.category} (
                {editingComplaint.brandModel || 'General'}) • Serial: {editingComplaint.serialNo || 'N/A'}
              </p>
              <p>
                <strong className="text-gray-400">Problem Reported:</strong>{' '}
                <span className="text-amber-300">{editingComplaint.description}</span>
              </p>
              <p>
                <strong className="text-gray-400">Location:</strong> {editingComplaint.serviceLocation}
              </p>
              {editingComplaint.photoUrl && (
                <div className="pt-1">
                  <a
                    href={editingComplaint.photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    View Attached Photo
                  </a>
                </div>
              )}
            </div>

            {/* Update Form */}
            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Complaint Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="New">New</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Assigned Technician</label>
                  <input
                    type="text"
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    placeholder="e.g. Amit Parmar"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Visit / Inspection Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Service Charges (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={serviceCharges}
                    onChange={(e) => setServiceCharges(Number(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Spare Parts Used</label>
                <input
                  type="text"
                  value={partsUsed}
                  onChange={(e) => setPartsUsed(e.target.value)}
                  placeholder="e.g. 512GB Kingston SSD, BNC DC Connectors, 450W SMPS"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Internal Engineering Notes</label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Notes for workshop records..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Service Ticket</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWhatsAppCustomer({ ...editingComplaint, status, assignedTechnician, visitDate, serviceCharges })}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
