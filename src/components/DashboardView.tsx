import React from 'react';
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Wrench,
  Receipt,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  FileDown,
  Database,
  Phone,
  MessageCircle,
} from 'lucide-react';
import {
  AppTab,
  Complaint,
  CompanyProfile,
  Customer,
  Invoice,
  Language,
  Product,
  Transaction,
} from '../types';
import { getT } from '../i18n';

interface DashboardViewProps {
  products: Product[];
  complaints: Complaint[];
  customers: Customer[];
  invoices: Invoice[];
  transactions: Transaction[];
  profile: CompanyProfile;
  lang: Language;
  onNavigateTab: (tab: AppTab) => void;
  onSelectComplaintForEdit: (complaint: Complaint) => void;
  onOpenNewProductModal: () => void;
  onOpenNewInvoiceModal: () => void;
  onOpenNewTransactionModal: () => void;
  onExportBackup: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  complaints,
  customers,
  invoices,
  transactions,
  profile,
  lang,
  onNavigateTab,
  onSelectComplaintForEdit,
  onOpenNewProductModal,
  onOpenNewInvoiceModal,
  onOpenNewTransactionModal,
  onExportBackup,
}) => {
  const t = getT(lang);

  // Complaints breakdown
  const newComplaints = complaints.filter((c) => c.status === 'New').length;
  const pendingComplaints = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressComplaints = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved').length;
  const closedComplaints = complaints.filter((c) => c.status === 'Closed').length;

  // Financial calculations
  const totalSalesBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCustomerReceived = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalCustomerOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const totalCashIn = transactions
    .filter((tr) => tr.type === 'INCOME')
    .reduce((sum, tr) => sum + tr.amount, 0);

  const totalCashOut = transactions
    .filter((tr) => tr.type === 'EXPENSE')
    .reduce((sum, tr) => sum + tr.amount, 0);

  // Inventory asset value (Stock * Purchase Price)
  const inventoryAssetCost = products.reduce(
    (sum, p) => sum + p.stockQuantity * p.purchasePrice,
    0
  );

  // Estimated profit = Total Cash In - Total Cash Out (Operating cash basis)
  const netOperatingProfit = totalCashIn - totalCashOut;

  // Low stock products
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStockAlert);

  // Recent Complaints (top 5)
  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeIn">
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
            onClick={onOpenNewProductModal}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>

          <button
            onClick={onOpenNewInvoiceModal}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>New GST Bill</span>
          </button>

          <button
            onClick={onOpenNewTransactionModal}
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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cash Inflow */}
        <div className="bg-gradient-to-br from-[#111c30] to-[#0b1220] border border-slate-700/70 rounded-2xl shadow-lg shadow-black/20 p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{t.totalCashIn}</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
            ₹{totalCashIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            Total realized payments (UPI, Cash, Bank)
          </p>
        </div>

        {/* Cash Outflow */}
        <div className="bg-gradient-to-br from-[#111c30] to-[#0b1220] border border-slate-700/70 rounded-2xl shadow-lg shadow-black/20 p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{t.totalCashOut}</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
            ₹{totalCashOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            Purchases, wages, shop rent & utilities
          </p>
        </div>

        {/* Customer Dues */}
        <div className="bg-gradient-to-br from-[#111c30] to-[#0b1220] border border-slate-700/70 rounded-2xl shadow-lg shadow-black/20 p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{t.customerDues}</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
            ₹{totalCustomerOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            Unpaid invoice balances from customers
          </p>
        </div>

        {/* Estimated Profit */}
        <div className="bg-gradient-to-br from-[#111c30] to-[#0b1220] border border-slate-700/70 rounded-2xl shadow-lg shadow-black/20 p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{t.estimatedProfit}</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black tracking-tight ${netOperatingProfit >= 0 ? 'text-white' : 'text-rose-400'}`}>
            ₹{netOperatingProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            Cash Net Margin (Inflow - Outflow)
          </p>
        </div>
      </div>

      {/* Complaints Pipeline Counter Bar */}
      <div className="bg-gradient-to-br from-[#111c30] to-[#0b1220] border border-slate-700/70 rounded-2xl shadow-lg shadow-black/20 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-400" />
            <span>Service Complaints Pipeline</span>
          </h2>
          <button
            onClick={() => onNavigateTab('complaints')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View All ({complaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="bg-[#080f1d] p-3 rounded-xl border border-blue-900/40 text-center">
            <span className="text-[10px] font-bold text-blue-400 block uppercase">{t.newComplaints}</span>
            <span className="text-xl font-black text-white">{newComplaints}</span>
          </div>
          <div className="bg-[#080f1d] p-3 rounded-xl border border-amber-900/40 text-center">
            <span className="text-[10px] font-bold text-amber-400 block uppercase">{t.pendingComplaints}</span>
            <span className="text-xl font-black text-white">{pendingComplaints}</span>
          </div>
          <div className="bg-[#080f1d] p-3 rounded-xl border border-purple-900/40 text-center">
            <span className="text-[10px] font-bold text-purple-400 block uppercase">{t.inProgressComplaints}</span>
            <span className="text-xl font-black text-white">{inProgressComplaints}</span>
          </div>
          <div className="bg-[#080f1d] p-3 rounded-xl border border-emerald-900/40 text-center">
            <span className="text-[10px] font-bold text-emerald-400 block uppercase">{t.resolvedComplaints}</span>
            <span className="text-xl font-black text-white">{resolvedComplaints}</span>
          </div>
          <div className="bg-[#080f1d] p-3 rounded-xl border border-gray-800 text-center">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">{t.closedComplaints}</span>
            <span className="text-xl font-black text-white">{closedComplaints}</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Service Tickets & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints Table */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#111c30] to-[#0b1220] border border-slate-700/70 rounded-2xl shadow-lg shadow-black/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Recent Service Complaints</span>
            </h3>
            <button
              onClick={() => onNavigateTab('complaints')}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Open Complaints Desk
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-500 uppercase border-b border-gray-800 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Category & Issue</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80">
                {recentComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-950/30 transition">
                    <td className="py-3 px-3 font-mono font-bold text-blue-400">{c.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{c.customerName}</div>
                      <div className="text-[10px] text-gray-400">{c.mobile}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-gray-200">{c.category}</div>
                      <div className="text-[10px] text-gray-500">{c.complaintType}</div>
                    </td>
                    <td className="py-3 px-3">
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
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => onSelectComplaintForEdit(c)}
                        className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded text-xs transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock & Inventory Value Box */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#111c30] to-[#0b1220] border border-slate-700/70 rounded-2xl shadow-lg shadow-black/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Low Stock Warnings</span>
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                {lowStockProducts.length} items
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                All inventory quantities are above safety threshold.
              </p>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-[#080f1d] rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-gray-500">{p.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-400">
                        {p.stockQuantity} left
                      </span>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => onNavigateTab('products')}
                  className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-xl transition text-center block"
                >
                  Manage Inventory & Restock
                </button>
              </div>
            )}
          </div>

          {/* Quick Business Details Card */}
          <div className="bg-gradient-to-br from-[#111c30] to-[#0b1220] border border-slate-700/70 rounded-2xl shadow-lg shadow-black/20 p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Inventory Asset Valuation
            </h3>
            <div className="text-2xl font-black text-white">
              ₹{inventoryAssetCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-gray-500">
              Total stock capital tied in inventory ({products.length} catalog items).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
