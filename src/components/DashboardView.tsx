import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
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
  FileText,
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
  InwardRecord,
  OutwardRecord,
  AntivirusLicense,
  Estimate,
} from '../types';
import { getT } from '../i18n';

interface DashboardViewProps {
  products: Product[];
  complaints: Complaint[];
  customers: Customer[];
  invoices: Invoice[];
  transactions: Transaction[];
  inwardRecords: InwardRecord[];
  outwardRecords: OutwardRecord[];
  antivirusLicenses: AntivirusLicense[];
  estimates: Estimate[];
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
  inwardRecords,
  outwardRecords,
  antivirusLicenses,
  estimates,
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
  const [quoteRequestsCount, setQuoteRequestsCount] = useState(0);

  useEffect(() => {
    let active = true;
    const loadQuoteCount = async () => {
      const { count, error } = await supabase
        .from('quote_requests')
        .select('id', { count: 'exact', head: true });
      if (!error && active) setQuoteRequestsCount(count ?? 0);
    };
    void loadQuoteCount();
    const channel = supabase
      .channel('dashboard-quote-requests-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quote_requests' }, () => {
        void loadQuoteCount();
      })
      .subscribe();
    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

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
      {/* Admin module shortcuts with live entry counts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-white">Admin Quick Access</h2>
            <p className="text-xs text-gray-400">Har module ki total entries — click karke seedha open karein</p>
          </div>
          <span className="text-[10px] font-bold rounded-full border border-blue-800 bg-blue-950 px-2.5 py-1 text-blue-300">LIVE COUNTS</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {([
            { label: 'Parties', count: customers.length, detail: 'Company / Party records', tab: 'customers' as AppTab, icon: Users, color: 'text-cyan-300' },
            { label: 'Products', count: products.length, detail: 'Items in inventory', tab: 'products' as AppTab, icon: Package, color: 'text-blue-300' },
            { label: 'Inward Entries', count: inwardRecords.length, detail: 'Received service items', tab: 'inward' as AppTab, icon: Package, color: 'text-amber-300' },
            { label: 'Outward Entries', count: outwardRecords.length, detail: 'Delivered service items', tab: 'outward' as AppTab, icon: CheckCircle2, color: 'text-emerald-300' },
            { label: 'Complaints', count: complaints.length, detail: 'Service tickets', tab: 'complaints' as AppTab, icon: Wrench, color: 'text-orange-300' },
            { label: 'Invoices', count: invoices.length, detail: 'Bills and invoices', tab: 'sales' as AppTab, icon: Receipt, color: 'text-violet-300' },
            { label: 'Payments', count: transactions.length, detail: 'Income + expense entries', tab: 'accounts' as AppTab, icon: DollarSign, color: 'text-green-300' },
            { label: 'Antivirus Licenses', count: antivirusLicenses.length, detail: 'License records', tab: 'antivirus' as AppTab, icon: Database, color: 'text-fuchsia-300' },
            { label: 'Estimates', count: estimates.length, detail: 'Quotation records', tab: 'profit' as AppTab, icon: Receipt, color: 'text-sky-300' },
            { label: 'Quote Requests', count: quoteRequestsCount, detail: 'Customer quote enquiries', tab: 'quotes' as AppTab, icon: FileText, color: 'text-cyan-300' },
            { label: 'Reports', count: invoices.length + transactions.length + complaints.length, detail: 'Records included in reports', tab: 'reports' as AppTab, icon: TrendingUp, color: 'text-pink-300' },
          ]).map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} type="button" onClick={() => onNavigateTab(item.tab)} className="group min-h-[112px] rounded-2xl border border-slate-700/80 bg-gradient-to-br from-[#111c30] to-[#0b1220] p-4 text-left shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-blue-500/70 hover:bg-blue-950/30 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <div className="flex items-center justify-between gap-2">
                  <Icon className={`h-5 w-5 ${item.color}`} />
                  <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-blue-300" />
                </div>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-white">{item.label}</div>
                    <div className="mt-0.5 text-[10px] text-slate-400">{item.detail}</div>
                  </div>
                  <div className="text-2xl font-black tabular-nums text-white">{item.count}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Complaints Pipeline Counter Bar */}
      <div role="button" tabIndex={0} onClick={() => onNavigateTab('products')} onKeyDown={(e) => e.key === 'Enter' && onNavigateTab('products')} title="Open product inventory" className="cursor-pointer hover:border-blue-500/60 transition bg-gradient-to-br from-[#111c30] to-[#0b1220] border border-slate-700/70 rounded-2xl shadow-lg shadow-black/20 p-5 space-y-3">
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
          <div role="button" tabIndex={0} onClick={() => onNavigateTab('complaints')} onKeyDown={(e) => e.key === 'Enter' && onNavigateTab('complaints')} title="Open complaint details" className="cursor-pointer hover:bg-blue-950/40 transition bg-[#080f1d] p-3 rounded-xl border border-blue-900/40 text-center">
            <span className="text-[10px] font-bold text-blue-400 block uppercase">{t.newComplaints}</span>
            <span className="text-xl font-black text-white">{newComplaints}</span>
          </div>
          <div role="button" tabIndex={0} onClick={() => onNavigateTab('complaints')} onKeyDown={(e) => e.key === 'Enter' && onNavigateTab('complaints')} title="Open complaint details" className="cursor-pointer hover:bg-blue-950/40 transition bg-[#080f1d] p-3 rounded-xl border border-amber-900/40 text-center">
            <span className="text-[10px] font-bold text-amber-400 block uppercase">{t.pendingComplaints}</span>
            <span className="text-xl font-black text-white">{pendingComplaints}</span>
          </div>
          <div role="button" tabIndex={0} onClick={() => onNavigateTab('complaints')} onKeyDown={(e) => e.key === 'Enter' && onNavigateTab('complaints')} title="Open complaint details" className="cursor-pointer hover:bg-blue-950/40 transition bg-[#080f1d] p-3 rounded-xl border border-purple-900/40 text-center">
            <span className="text-[10px] font-bold text-purple-400 block uppercase">{t.inProgressComplaints}</span>
            <span className="text-xl font-black text-white">{inProgressComplaints}</span>
          </div>
          <div role="button" tabIndex={0} onClick={() => onNavigateTab('complaints')} onKeyDown={(e) => e.key === 'Enter' && onNavigateTab('complaints')} title="Open complaint details" className="cursor-pointer hover:bg-blue-950/40 transition bg-[#080f1d] p-3 rounded-xl border border-emerald-900/40 text-center">
            <span className="text-[10px] font-bold text-emerald-400 block uppercase">{t.resolvedComplaints}</span>
            <span className="text-xl font-black text-white">{resolvedComplaints}</span>
          </div>
          <div role="button" tabIndex={0} onClick={() => onNavigateTab('complaints')} onKeyDown={(e) => e.key === 'Enter' && onNavigateTab('complaints')} title="Open complaint details" className="cursor-pointer hover:bg-blue-950/40 transition bg-[#080f1d] p-3 rounded-xl border border-gray-800 text-center">
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
                  <tr key={c.id} onClick={() => onSelectComplaintForEdit(c)} className="hover:bg-blue-950/50 transition cursor-pointer" title="Click to open full complaint details">
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
                    role="button"
                    tabIndex={0}
                    onClick={() => onNavigateTab('products')}
                    onKeyDown={(e) => e.key === 'Enter' && onNavigateTab('products')}
                    title="Open product inventory"
                    className="p-3 bg-[#080f1d] rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-blue-500/60 transition"
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
