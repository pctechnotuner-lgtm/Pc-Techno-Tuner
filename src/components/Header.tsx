import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  Phone,
  MessageCircle,
  Download,
  Menu,
  X,
  Languages,
  LayoutDashboard,
  Package,
  Users,
  AlertCircle,
  Receipt,
  Wallet,
  BarChart3,
  TrendingUp,
  Settings,
  ShoppingBag,
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import { AppTab, CompanyProfile, Language } from '../types';
import { getT } from '../i18n';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  profile: CompanyProfile;
  lang: Language;
  setLang: (lang: Language) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  onOpenLoginModal: () => void;
  newComplaintsCount: number;
  lowStockCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  lang,
  setLang,
  activeTab,
  setActiveTab,
  isAdmin,
  setIsAdmin,
  onOpenLoginModal,
  newComplaintsCount,
  lowStockCount,
}) => {
  const t = getT(lang);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: AppTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`${isAdmin ? "relative bg-gray-950/95" : "sticky top-0 bg-gray-950/95 backdrop-blur-md"} z-40 border-b border-gray-800 transition-all`}>
      {/* Top Banner with Brand & Quick Actions */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 ${isAdmin ? "md:ml-64 md:max-w-none" : ""}`}>
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleNavClick('catalogue')}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-extrabold text-white text-lg tracking-wider shadow-lg shadow-blue-500/25 border border-blue-400/30 group-hover:scale-105 transition-transform">
            PT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                {profile.name}
              </span>
</div>
</div>
        </div>

        {/* Right Actions: WhatsApp direct, Language, PWA install, Admin Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Direct WhatsApp Callout */}
          <a
            href={`https://wa.me/${profile.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-400 text-xs font-semibold shadow-sm transition"
            title="Chat on WhatsApp: +91 7383871195"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>{profile.mobile}</span>
          </a>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Primary Navigation Tab Bar (Desktop) */}
      <nav className={`hidden md:block ${isAdmin ? "fixed left-0 top-0 bottom-0 z-50 w-64 bg-[#0b1220] border-r border-slate-800 px-4 pt-5 shadow-2xl" : "bg-gray-900/60 border-t border-gray-800/80 px-4"}`}>
        <div className={`${isAdmin ? "h-full flex flex-col items-stretch justify-start gap-5 overflow-y-auto py-2" : "max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-1.5"}`}>
          <div className={`${isAdmin ? "flex flex-col items-stretch gap-1.5" : "flex items-center gap-1"}`}>
            {/* Customer Facing Tabs */}
            <button
              onClick={() => handleNavClick('catalogue')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition w-full text-left ${
                activeTab === 'catalogue'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t.publicCatalogue}</span>
            </button>

            <button
              onClick={() => handleNavClick('complaint')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition w-full text-left ${
                activeTab === 'complaint'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.bookComplaint}</span>
            </button>

            {/* Admin Tabs Divider */}
            {isAdmin && (
              <>
                <div className="h-4 w-[1px] bg-gray-800 mx-2" />

                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition w-full text-left ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{t.dashboard}</span>
                </button>

                <button
                  onClick={() => handleNavClick('products')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition relative w-full text-left ${
                    activeTab === 'products'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>{t.products}</span>
                  {lowStockCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                      {lowStockCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNavClick('complaints')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition relative w-full text-left ${
                    activeTab === 'complaints'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{t.complaints}</span>
                  {newComplaintsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-gray-950">
                      {newComplaintsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNavClick('customers')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition w-full text-left ${
                    activeTab === 'customers'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{t.customers}</span>
                </button>

                <button
                  onClick={() => handleNavClick('sales')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition w-full text-left ${
                    activeTab === 'sales'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{t.sales}</span>
                </button>

                <button
                  onClick={() => handleNavClick('profit')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition w-full text-left ${
                    activeTab === 'profit'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Estimated Profit</span>
                </button>

                <button
                  onClick={() => handleNavClick('accounts')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition w-full text-left ${
                    activeTab === 'accounts'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{t.accounts}</span>
                </button>

                <button
                  onClick={() => handleNavClick('reports')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition w-full text-left ${
                    activeTab === 'reports'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{t.reports}</span>
                </button>

                <button
                  onClick={() => handleNavClick('antivirus')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition w-full text-left ${activeTab === 'antivirus' ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-300" />
                  <span>Antivirus Licenses</span>
                </button>

                <button
                  onClick={() => handleNavClick('settings')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition w-full text-left ${
                    activeTab === 'settings'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{t.settings}</span>
                </button>
              </>
            )}
          </div>

          <div className={`${isAdmin ? "mt-auto rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-[10px] text-slate-400 break-all" : "flex items-center gap-2 text-[11px] text-gray-400"}`}>
            <div className="space-y-1"><div className="font-bold text-slate-200">PC TECHNO TUNER</div><span className="font-mono text-gray-500">GST: {profile.gstin}</span><div className="text-slate-500">Ahmedabad • 382418</div></div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-950 border-b border-gray-800 px-4 py-3 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800 mb-2">
            <Languages className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400 mr-2">Language</span>
            <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-lg text-xs font-semibold ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-300'}`}>EN</button>
            <button onClick={() => setLang('gu')} className={`px-3 py-1 rounded-lg text-xs font-semibold ${lang === 'gu' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-300'}`}>ગુજરાતી</button>
            <button onClick={() => setLang('hi')} className={`px-3 py-1 rounded-lg text-xs font-semibold ${lang === 'hi' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-300'}`}>हिन्दी</button>
          </div>
          <button
            onClick={() => handleNavClick('catalogue')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'catalogue' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.publicCatalogue}</span>
          </button>

          <button
            onClick={() => handleNavClick('complaint')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'complaint' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-900'
            }`}
          >
            <Wrench className="w-4 h-4 text-blue-400" />
            <span>{t.bookComplaint}</span>
          </button>

          {isAdmin ? (
            <>
              <div className="pt-2 pb-1 border-t border-gray-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-3">
                  Admin Administration
                </span>
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); setIsAdmin(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-rose-300 hover:bg-gray-900"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{t.adminLogout}</span>
              </button>
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t.dashboard}</span>
              </button>

              <button
                onClick={() => handleNavClick('products')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  activeTab === 'products' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  <span>{t.products}</span>
                </div>
                {lowStockCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                    {lowStockCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('complaints')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  activeTab === 'complaints' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t.complaints}</span>
                </div>
                {newComplaintsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-gray-950">
                    {newComplaintsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('customers')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  activeTab === 'customers' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{t.customers}</span>
              </button>

              <button
                onClick={() => handleNavClick('sales')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  activeTab === 'sales' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>{t.sales}</span>
              </button>

              <button
                onClick={() => handleNavClick('profit')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === 'profit' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Estimated Profit</span>
              </button>

              <button
                onClick={() => handleNavClick('accounts')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  activeTab === 'accounts' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>{t.accounts}</span>
              </button>

              <button
                onClick={() => handleNavClick('reports')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  activeTab === 'reports' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>{t.reports}</span>
              </button>

              <button
                onClick={() => handleNavClick('antivirus')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'antivirus' ? 'bg-violet-600 text-white' : 'text-gray-300 hover:bg-gray-900'}`}
              >
                <ShieldCheck className="w-4 h-4 text-violet-300" />
                <span>Antivirus Licenses</span>
              </button>

              <button
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>{t.settings}</span>
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-gray-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLoginModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold shadow"
              >
                <Shield className="w-4 h-4" />
                <span>{t.adminLogin}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* iOS PWA Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-2xl text-white space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" />
              Install on iPhone or iPad
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              1. Tap the <strong className="text-white">Share</strong> button (box with an arrow) in Safari’s bottom toolbar.<br /><br />
              2. Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.<br /><br />
              3. Tap <strong className="text-blue-400">Add</strong> in the top-right corner.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
