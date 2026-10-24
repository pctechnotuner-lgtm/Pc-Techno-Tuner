import React, { useState } from 'react';
import {
  Settings,
  Building,
  ShieldCheck,
  Save,
  Download,
  Upload,
  Lock,
  RefreshCcw,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { CompanyProfile, Language } from '../types';
import { getT } from '../i18n';
import { storage } from '../storage';

interface SettingsViewProps {
  profile: CompanyProfile;
  lang: Language;
  onSaveProfile: (profile: CompanyProfile) => void;
  onExportBackup: () => void;
  onRestoreBackup: (jsonData: any) => boolean;
  onResetDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  lang,
  onSaveProfile,
  onExportBackup,
  onRestoreBackup,
  onResetDefaults,
}) => {
  const t = getT(lang);

  // Profile Form state
  const [name, setName] = useState(profile.name);
  const [tagline, setTagline] = useState(profile.tagline);
  const [address, setAddress] = useState(profile.address);
  const [location, setLocation] = useState(profile.location);
  const [pincode, setPincode] = useState(profile.pincode);
  const [mobile, setMobile] = useState(profile.mobile);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp);
  const [email, setEmail] = useState(profile.email);
  const [gstin, setGstin] = useState(profile.gstin);
  const [pan, setPan] = useState(profile.pan);
  const [defaultGstRate, setDefaultGstRate] = useState(profile.defaultGstRate || 18);
  const [bankName, setBankName] = useState(profile.bankName || '');
  const [accountNumber, setAccountNumber] = useState(profile.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(profile.ifscCode || '');
  const [upiId, setUpiId] = useState(profile.upiId || '');
  const [terms, setTerms] = useState(profile.terms || '');
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl || '');

  // Admin Password
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [newUsername, setNewUsername] = useState(storage.getAdminUsername());

  // File restore state
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CompanyProfile = {
      name: name.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      location: location.trim(),
      pincode: pincode.trim(),
      mobile: mobile.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      gstin: gstin.trim(),
      pan: pan.trim(),
      defaultGstRate: Number(defaultGstRate),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim(),
      upiId: upiId.trim(),
      terms: terms.trim(),
      logoUrl: logoUrl.trim() || undefined,
    };
    onSaveProfile(updated);
    alert('Company configurations saved successfully.');
  };

  const handleChangeUsername = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newUsername.trim();
    if (clean.length < 3) {
      setPassMessage({ text: 'Username kam se kam 3 character ka hona chahiye.', isError: true });
      return;
    }
    storage.setAdminUsername(clean);
    setPassMessage({ text: `Login user ID "${clean}" set ho gaya.`, isError: false });
  };
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const actualPass = storage.getAdminPassword();
    if (currentPass !== actualPass) {
      setPassMessage({ text: 'Current password does not match.', isError: true });
      return;
    }
    if (newPass.length < 4) {
      setPassMessage({ text: 'New password must be at least 4 characters.', isError: true });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMessage({ text: 'New passwords do not match.', isError: true });
      return;
    }

    storage.setAdminPassword(newPass);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setPassMessage({ text: 'Admin password updated successfully.', isError: false });
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const success = onRestoreBackup(json);
        if (success) {
          setRestoreStatus('Database backup restored successfully! Reloading...');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          setRestoreStatus('Invalid backup file structure.');
        }
      } catch (err) {
        setRestoreStatus('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-500" />
            <span>Company Profile & System Settings</span>
          </h1>
          <p className="text-xs text-gray-400">
            Configure trade name, GSTIN, WhatsApp routing, bank settlement details, and system backups.
          </p>
        </div>
      </div>

      {/* Company Profile Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-3">
          <Building className="w-4 h-4 text-blue-400" />
          <span>Business Identity & Contact Profile</span>
        </h2>

        <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Company Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Business Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">City & State</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Postal PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Default GST Rate (%)</label>
              <input
                type="number"
                value={defaultGstRate}
                onChange={(e) => setDefaultGstRate(Number(e.target.value))}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-semibold">Full Workshop Address in Ahmedabad</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Office Mobile Number</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">WhatsApp Number (with country code)</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">GSTIN</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">PAN</label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
              />
            </div>
          </div>

          {/* Bank & UPI for Print Invoices */}
          <div className="pt-2 border-t border-gray-800 space-y-3">
            <span className="font-bold text-white text-xs block">Bank & UPI Settlement (Prints on Bills)</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-gray-400 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-semibold">Terms & Warranty Conditions on Invoice</label>
            <textarea
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </form>
      </div>

      {/* Admin Security Password */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-3">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Admin Security & Password</span>
        </h2>

        <form onSubmit={handleChangeUsername} className="space-y-3 text-xs max-w-md pb-3 border-b border-gray-800">
          <div>
            <label className="block text-gray-400 mb-1">Login User ID</label>
            <input
              type="text"
              required
              autoCapitalize="none"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white"
            />
          </div>
          <button
            type="submit"
            className="py-2 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition"
          >
            Update User ID
          </button>
        </form>
        <form onSubmit={handleChangePassword} className="space-y-3 text-xs max-w-md">
          <div>
            <label className="block text-gray-400 mb-1">Current Admin Password</label>
            <input
              type="password"
              required
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="Default: admin123"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {passMessage && (
            <p className={`text-xs ${passMessage.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
              {passMessage.text}
            </p>
          )}

          <button
            type="submit"
            className="py-2 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition"
          >
            Update Admin Password
          </button>
        </form>
      </div>

      {/* Data Backup & Disaster Recovery */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-3">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>Data Storage, Backup & Restore</span>
        </h2>

        <p className="text-xs text-gray-300 leading-relaxed">
          Your complete business data (products, complaints, customer directory, invoices, and accounting entries) is persistently saved. You can take an offline JSON backup at any time or restore it on a new computer or phone.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={onExportBackup}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-2 shadow"
          >
            <Download className="w-4 h-4" />
            <span>{t.backupData}</span>
          </button>

          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-bold text-xs transition">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>{t.restoreData}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileRestore}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (confirm('Reset application to original initial seed demo data? Your current edits will be re-initialized.')) {
                onResetDefaults();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-gray-950 hover:bg-rose-950 text-gray-400 hover:text-rose-400 border border-gray-800 text-xs font-semibold transition flex items-center gap-2"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {restoreStatus && (
          <p className="text-xs text-blue-400 mt-2 font-medium">{restoreStatus}</p>
        )}
      </div>
    </div>
  );
};
