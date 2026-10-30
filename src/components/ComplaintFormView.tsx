import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle,
  MessageCircle,
  AlertTriangle,
  Upload,
  Calendar,
  MapPin,
  Phone,
  User,
  Building,
  ShieldAlert,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import {
  CompanyProfile,
  Complaint,
  ComplaintType,
  COMPLAINT_TYPES,
  Customer,
  Language,
  ProductCategory,
  PRODUCT_CATEGORIES,
  WarrantyStatus,
} from '../types';
import { getT } from '../i18n';
import { supabase } from '../lib/supabaseClient';

interface ComplaintFormViewProps {
  profile: CompanyProfile;
  lang: Language;
  onComplaintSubmitted: (complaint: Complaint) => void;
}

export const ComplaintFormView: React.FC<ComplaintFormViewProps> = ({
  profile,
  lang,
  onComplaintSubmitted,
}) => {
  const t = getT(lang);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Desktop Computers');
  const [brandModel, setBrandModel] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyStatus, setWarrantyStatus] = useState<WarrantyStatus>('Under Warranty');
  const [complaintType, setComplaintType] = useState<ComplaintType>('Hardware Problem');
  const [description, setDescription] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  // Success State
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !mobile.trim() || !description.trim() || !serviceLocation.trim()) {
      alert('Please fill in all mandatory fields (*)');
      return;
    }

    if (!whatsappConsent) {
      alert('Please agree to receive complaint updates on WhatsApp.');
      return;
    }

    setIsSubmitting(true);
    const complaintId = `PCT-COMP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id: complaintId,
      customerName: customerName.trim(),
      mobile: mobile.trim(),
      businessName: businessName.trim() || undefined,
      category,
      brandModel: brandModel.trim() || undefined,
      serialNo: serialNo.trim() || undefined,
      purchaseDate: purchaseDate || undefined,
      warrantyStatus,
      complaintType,
      description: description.trim(),
      serviceLocation: serviceLocation.trim(),
      preferredDate: preferredDate || undefined,
      photoUrl: attachmentPreview || undefined,
      status: 'New',
      serviceCharges: 0,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const { error } = await supabase.functions.invoke('submit-complaint', {
        body: { ...newComplaint, whatsappConsent },
      });
      if (error) throw error;
      onComplaintSubmitted(newComplaint);
      setSubmittedComplaint(newComplaint);
    } catch (error) {
      console.error('Complaint submission failed:', error);
      alert('Complaint cloud par save nahi hui. Kripya internet check karke dobara try karein.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppMessageText = (c: Complaint) => {
    return `PC TECHNO TUNER — NEW CUSTOMER COMPLAINT

Complaint ID: ${c.id}
Customer Name: ${c.customerName}
Mobile Number: ${c.mobile}
Product Category: ${c.category}
Product Model: ${c.brandModel || 'N/A'}
Serial Number: ${c.serialNo || 'N/A'}
Warranty Status: ${c.warrantyStatus}
Complaint Description: ${c.description}
Service Location: ${c.serviceLocation}
Preferred Date: ${c.preferredDate || 'Earliest available visit'}`;
  };

  const handleOpenWhatsApp = (c: Complaint) => {
    const text = getWhatsAppMessageText(c);
    const url = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyMessage = (c: Complaint) => {
    const text = getWhatsAppMessageText(c);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetForm = () => {
    setSubmittedComplaint(null);
    setCustomerName('');
    setMobile('');
    setBusinessName('');
    setCategory('Desktop Computers');
    setBrandModel('');
    setSerialNo('');
    setPurchaseDate('');
    setWarrantyStatus('Under Warranty');
    setComplaintType('Hardware Problem');
    setDescription('');
    setServiceLocation('');
    setPreferredDate('');
    setWhatsappConsent(false);
    setAttachmentPreview(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Info Banner */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {t.bookComplaint}
            </h1>
            <p className="text-xs text-gray-400">
              Immediate On-site Service & Repair Dispatch in Ahmedabad
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          Submit your hardware or IT trouble ticket below. Your complaint will be logged into our central service tracking system, and you will receive an instant Reference ID with one-tap WhatsApp forwarding to our Ahmedabad engineering desk.
        </p>
      </div>

      {/* Submission Success View */}
      {submittedComplaint ? (
        <div className="bg-gray-900 border border-emerald-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleUp">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {t.ticketSubmittedTitle}
              </h2>
              <p className="text-xs text-emerald-300">
                Ticket Reference: <span className="font-mono font-bold text-white text-sm bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">{submittedComplaint.id}</span>
              </p>
            </div>
          </div>

          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs space-y-2">
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Customer:</span>
              <span className="font-bold text-white">{submittedComplaint.customerName} ({submittedComplaint.mobile})</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Product / Model:</span>
              <span className="text-white">{submittedComplaint.category} - {submittedComplaint.brandModel || 'Standard'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Complaint Type:</span>
              <span className="text-amber-400 font-semibold">{submittedComplaint.complaintType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Service Location:</span>
              <span className="text-gray-200 text-right max-w-xs">{submittedComplaint.serviceLocation}</span>
            </div>
          </div>

          {/* Action Callout */}
          <div className="bg-emerald-950/40 border border-emerald-700/50 p-4 rounded-xl space-y-3">
            <p className="text-xs text-gray-200 leading-relaxed">
              <strong className="text-emerald-400">Next Step:</strong> Tap below to notify <strong className="text-white">PC TECHNO TUNER (+91 {profile.mobile})</strong> on WhatsApp. Your complete ticket details have been pre-filled.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleOpenWhatsApp(submittedComplaint)}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{t.sendOnWhatsApp}</span>
              </button>

              <button
                onClick={() => handleCopyMessage(submittedComplaint)}
                className="py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Details' : 'Copy Message'}</span>
              </button>
            </div>

            <p className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{t.whatsAppClickToChatNote}</span>
            </p>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={handleResetForm}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline"
            >
              Submit Another Complaint / Service Ticket
            </button>
          </div>
        </div>
      ) : (
        /* The Complaint Form */
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.customerName} *</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.mobileNumber} (WhatsApp) *</span>
              </label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="10 digit mobile number"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-gray-400" />
                <span>{t.businessName} (Optional)</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Company / Firm / Shop Name"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                {t.productCategory} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                {t.brandAndModel}
              </label>
              <input
                type="text"
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                placeholder="e.g. HP LaserJet / Hikvision 4CH"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                {t.serialNumber}
              </label>
              <input
                type="text"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
                placeholder="From device back label"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                {t.warrantyStatus}
              </label>
              <select
                value={warrantyStatus}
                onChange={(e) => setWarrantyStatus(e.target.value as WarrantyStatus)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Under Warranty">Under Warranty</option>
                <option value="Out of Warranty">Out of Warranty</option>
                <option value="AMC Coverage">Under AMC Coverage</option>
                <option value="Not Sure">Not Sure / Check Bill</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.complaintType} *</span>
              </label>
              <select
                value={complaintType}
                onChange={(e) => setComplaintType(e.target.value as ComplaintType)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {COMPLAINT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.preferredDate}</span>
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.serviceLocation} *</span>
            </label>
            <input
              type="text"
              required
              value={serviceLocation}
              onChange={(e) => setServiceLocation(e.target.value)}
              placeholder="e.g. 402, Navrang Complex, C.G. Road, Ahmedabad — 380009"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              {t.complaintDescription} *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe exactly what happens (e.g. system doesn't turn on, camera is showing black screen, printer keeps paper jamming, no internet on switch)..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* Optional Attachment */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              {t.photoAttachment}
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 hover:border-gray-700 text-xs text-gray-300 hover:text-white transition">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Choose Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {attachmentPreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={attachmentPreview}
                    alt="Preview"
                    className="w-10 h-10 object-cover rounded-lg border border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachmentPreview(null)}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <label className="flex items-start gap-2 text-xs text-gray-300">
            <input type="checkbox" required checked={whatsappConsent} onChange={(e) => setWhatsappConsent(e.target.checked)} className="mt-0.5" />
            <span>I agree to receive WhatsApp updates about this complaint on the mobile number provided.</span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full disabled:opacity-60 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : t.submitTicket}</span>
          </button>
        </form>
      )}
    </div>
  );
};
