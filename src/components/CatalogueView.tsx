import React, { useEffect, useState } from 'react';
import { openWhatsAppBusiness, getWhatsAppBusinessUrl } from '../lib/whatsapp';
import {
  Search,
  MessageCircle,
  FileText,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Cpu,
  Monitor,
  Camera,
  Printer,
  Mouse,
  Network,
  Server,
  Shield,
  Fingerprint,
  Code,
  HardDrive,
} from 'lucide-react';
import { CompanyProfile, Language, Product, ProductCategory, PRODUCT_CATEGORIES } from '../types';
import { getT } from '../i18n';

interface CatalogueViewProps {
  products: Product[];
  profile: CompanyProfile;
  lang: Language;
  onNavigateToComplaint: () => void;
  onNavigateToQuote: () => void;
}

export const CatalogueView: React.FC<CatalogueViewProps> = ({
  products,
  profile,
  lang,
  onNavigateToComplaint,
  onNavigateToQuote,
}) => {
  const t = getT(lang);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);
  const [heroSlide, setHeroSlide] = useState(0);
  const heroSlides = [
    { title: 'Desktop Computers', subtitle: 'Powerful business desktops', image: `${import.meta.env.BASE_URL}hero/desktop.svg` },
    { title: 'Business Laptops', subtitle: 'Work anywhere, stay productive', image: `${import.meta.env.BASE_URL}hero/laptop.svg` },
    { title: 'CCTV Security', subtitle: 'Smart surveillance for your business', image: `${import.meta.env.BASE_URL}hero/cctv.svg` },
    { title: 'Printers & Scanners', subtitle: 'Reliable office printing solutions', image: `${import.meta.env.BASE_URL}hero/printer.svg` },
  ];
  useEffect(() => {
    const slideTimer = window.setInterval(() => setHeroSlide((current) => (current + 1) % heroSlides.length), 2000);
    return () => window.clearInterval(slideTimer);
  }, []);

  // Filter products: only available items shown in catalogue
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specifications.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (cat: ProductCategory | 'All') => {
    switch (cat) {
      case 'Desktop Computers':
        return <Monitor className="w-3.5 h-3.5" />;
      case 'Laptops':
        return <Cpu className="w-3.5 h-3.5" />;
      case 'CCTV Cameras and DVR/NVR':
        return <Camera className="w-3.5 h-3.5" />;
      case 'Printers and Scanners':
        return <Printer className="w-3.5 h-3.5" />;
      case 'Computer Accessories':
        return <Mouse className="w-3.5 h-3.5" />;
      case 'Networking Products and Routers':
        return <Network className="w-3.5 h-3.5" />;
      case 'Servers and Storage':
        return <Server className="w-3.5 h-3.5" />;
      case 'Firewall and Antivirus Software':
        return <Shield className="w-3.5 h-3.5" />;
      case 'Biometric and Attendance Machines':
        return <Fingerprint className="w-3.5 h-3.5" />;
      case 'Software and IT Services':
        return <Code className="w-3.5 h-3.5" />;
      default:
        return <HardDrive className="w-3.5 h-3.5" />;
    }
  };

  const handleEnquireWhatsApp = (_product: Product) => openWhatsAppBusiness(profile.whatsapp);

  const handleRequestQuoteWhatsApp = (_product?: Product) => onNavigateToQuote();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Brand left, rotating product showcase center, quick actions right */}
      <section className="relative overflow-hidden rounded-2xl border border-blue-900/60 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 shadow-2xl">
        <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 items-center gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(280px,1.15fr)_250px] lg:gap-7 lg:p-8">
          <div className="min-w-0 text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Authorized IT Products & AMC Services • Ahmedabad</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-black tracking-tight leading-tight text-white">
              {profile.name || 'PC TECHNO TUNER'}
            </h1>
            <p className="mt-3 text-base font-bold text-cyan-300">
              IT Hardware • CCTV • Laptop Repairs • AMC
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Premium technology and dependable support for your business.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative h-48 overflow-hidden rounded-2xl border border-blue-400/30 bg-slate-900 shadow-[0_18px_55px_rgba(0,0,0,.4)] sm:h-56 lg:h-64">
              {heroSlides.map((slide, index) => (
                <div key={slide.title} className={`absolute inset-0 transition-all duration-700 ${index === heroSlide ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-105'}`}>
                  <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" loading={index === 0 ? 'eager' : 'lazy'} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xl font-black text-white drop-shadow-lg">{slide.title}</p>
                    <p className="text-xs font-medium text-slate-200">{slide.subtitle}</p>
                  </div>
                </div>
              ))}
              <div className="absolute bottom-3 right-4 z-10 flex gap-1.5">
                {heroSlides.map((slide, index) => <button key={slide.title} type="button" aria-label={`Show ${slide.title}`} onClick={() => setHeroSlide(index)} className={`h-2 rounded-full transition-all ${index === heroSlide ? 'w-6 bg-cyan-300' : 'w-2 bg-white/60'}`} />)}
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] font-semibold tracking-wide text-slate-400">COMPUTERS • LAPTOPS • CCTV • PRINTERS</p>
          </div>

          <div className="relative flex flex-col gap-3 lg:border-l lg:border-blue-800/70 lg:pl-6">
            <p className="mb-1 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Quick Actions</p>
            <button onClick={onNavigateToComplaint} className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300 bg-cyan-500 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400">
              <Wrench className="h-4 w-4" /><span>{t.bookComplaint}</span>
            </button>
            <button onClick={() => handleRequestQuoteWhatsApp()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500">
              <MessageCircle className="h-4 w-4" /><span>{t.requestQuote}</span>
            </button>
            <a href={`tel:${profile.mobile}`} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm font-bold text-slate-100 transition hover:bg-slate-800">
              <Phone className="h-4 w-4 text-emerald-400" /><span>Call: {profile.mobile}</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-slate-700/70 pt-4 text-[11px] text-slate-400 lg:col-span-3">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-blue-400" /> GSTIN: <strong className="font-mono text-slate-200">{profile.gstin}</strong></span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> PAN: <strong className="font-mono text-slate-200">{profile.pan}</strong></span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-rose-400" /> Ahmedabad PIN: <strong className="font-mono text-slate-200">{profile.pincode}</strong></span>
          </div>
        </div>
      </section>

      {/* Filter and Search Controls */}
      <div id="pt-products" className="space-y-4 scroll-mt-28">
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Categories Chip Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <span>{t.allCategories}</span>
            <span className="text-[10px] opacity-75">({products.length})</span>
          </button>

          {PRODUCT_CATEGORIES.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-3">
          <Search className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No products found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            We supply all custom configurations and hardware. Please call or WhatsApp us at {profile.mobile} for immediate stock inquiries.
          </p>
          <button
            onClick={() => handleRequestQuoteWhatsApp()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500"
          >
            Enquire on WhatsApp
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const isLowStock = product.stockQuantity <= product.minStockAlert;
            return (
              <div
                key={product.id}
                className="group bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-[16/10] bg-gray-950 overflow-hidden">
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&h=450&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-950/80 backdrop-blur-md text-blue-400 border border-blue-900/40">
                      {product.category}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    {product.stockQuantity > 0 ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-800/40">
                        {t.inStock}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-950/80 backdrop-blur-md text-rose-300 border border-rose-800/40">
                        {t.outOfStock}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="font-semibold text-gray-300">{product.brand}</span>
                      <span className="font-mono text-gray-500">{product.model}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                      {product.specifications}
                    </p>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="pt-3 border-t border-gray-800 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-gray-500 block uppercase font-medium">
                          {t.sellingPrice}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-white tracking-tight">
                            ₹{product.sellingPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/40">
                          <ShieldCheck className="w-3 h-3 text-blue-400" />
                          <span>{product.warrantyMonths} {t.months}</span>
                        </span>
                      </div>
                    </div>

                    {/* Customer Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleEnquireWhatsApp(product)}
                        className="w-full py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                        title="Enquire directly on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Enquire</span>
                      </button>

                      <button
                        onClick={() => handleRequestQuoteWhatsApp(product)}
                        className="w-full py-2 px-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-bold transition flex items-center justify-center gap-1"
                        title="Request official GST quotation"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>Quote</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Contact & Trust Bar */}
      <div id="pt-about" className="bg-gray-900/70 scroll-mt-28 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Ahmedabad Service Center</span>
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {profile.address}, {profile.location} — {profile.pincode}
            </p>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Mon - Sat: 9:30 AM to 8:30 PM</span>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Direct Support Helpline</span>
            </h4>
            <p className="text-xs text-gray-400">
              Mobile / WhatsApp: <a href={getWhatsAppBusinessUrl(profile.whatsapp)} className="text-white hover:underline font-mono font-bold">{profile.mobile}</a>
            </p>
            <p className="text-xs text-gray-400">
              Email: <a href={`mailto:${profile.email}`} className="text-white hover:underline">{profile.email}</a>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Tax & Business Compliance</span>
            </h4>
            <p className="text-xs text-gray-400">
              GSTIN: <span className="font-mono text-gray-200">{profile.gstin}</span>
            </p>
            <p className="text-xs text-gray-400">
              PAN: <span className="font-mono text-gray-200">{profile.pan}</span>
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {profile.name} • Ahmedabad, Gujarat, India. All rights reserved.
        </div>
      </div>
    </div>
  );
};
