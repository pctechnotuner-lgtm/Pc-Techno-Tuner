import React from 'react';
import { CompanyProfile } from '../types';
import { PlusCircle, Receipt, DollarSign, Database, Settings2 } from 'lucide-react';

interface MoreViewProps {
  profile: CompanyProfile;
  onOpenNewProduct: () => void;
  onOpenNewInvoice: () => void;
  onOpenNewTransaction: () => void;
  onExportBackup: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  profile,
  onOpenNewProduct,
  onOpenNewInvoice,
  onOpenNewTransaction,
  onExportBackup,
}) => (
  <div className="space-y-5 animate-fadeIn">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-blue-500/10 p-3 text-blue-300"><Settings2 className="h-6 w-6" /></div>
      <div><h1 className="text-xl font-black text-white">More / Options</h1><p className="text-xs text-slate-400">Business overview and quick actions</p></div>
    </div>
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-[#111c30] to-[#0b1220] border border-slate-700/70 rounded-2xl shadow-lg shadow-black/20 p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>PC TECHNO TUNER • BUSINESS OVERVIEW</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
              PREMIUM WORKSPACE
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Business performance, service operations and inventory at a glance • GSTIN: {profile.gstin}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onOpenNewProduct}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>

          <button
            onClick={onOpenNewInvoice}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>New GST Bill</span>
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5 text-blue-400" />
            <span>Record Cash</span>
          </button>

          <button
            onClick={onExportBackup}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-xs transition"
            title="Download JSON Database Backup"
          >
            <Database className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>


  </div>
);
