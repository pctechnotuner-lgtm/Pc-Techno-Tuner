import React, { useState } from 'react';
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
}

export const CatalogueView: React.FC<CatalogueViewProps> = ({
  products,
  profile,
  lang,
  onNavigateToComplaint,
}) => {
  const t = getT(lang);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);

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

  const handleEnquireWhatsApp = (product: Product) => {
    const message = `Hello PC TECHNO TUNER,
I am interested in purchasing/enquiring about:
Product: ${product.name}
Brand/Model: ${product.brand} (${product.model})
Category: ${product.category}
Price Listed: ₹${product.sellingPrice.toLocaleString('en-IN')}
Specifications: ${product.specifications}

Could you please confirm current availability and dispatch details for Ahmedabad?`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${profile.whatsapp}?text=${encoded}`, '_blank');
  };

  const handleRequestQuoteWhatsApp = (product?: Product) => {
    const pName = product ? `${product.name} (${product.brand} ${product.model})` : 'IT Hardware & AMC Solution';
    const message = `Hello PC TECHNO TUNER,
I would like to request an official GST quotation for:
Requirement: ${pName}
Location: Ahmedabad

Please send me the formal quotation including delivery and installation.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${profile.whatsapp}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* High Impact Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-blue-950 to-gray-950 border border-blue-900/50 shadow-2xl p-6 sm:p-10">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-0 opacity-10 pointer-events-none">
          <Monitor className="w-64 h-64 text-blue-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Authorized IT Products & AMC Services • Ahmedabad</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Premium IT Hardware & CCTV Security for Your Business
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
            From high-speed custom office desktops, corporate laptops, and enterprise CCTV surveillance to reliable printers, routers, and servers — tuned and maintained by {profile.name}.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => handleRequestQuoteWhatsApp()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.requestQuote}</span>
            </button>

            <button
              onClick={onNavigateToComplaint}
              className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 font-bold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <Wrench className="w-4 h-4 text-blue-400" />
              <span>{t.bookComplaint}</span>
            </button>

            <a
              href={`tel:${profile.mobile}`}
              className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 font-bold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call: {profile.mobile}</span>
            </a>
          </div>

          {/* Quick Business Credentials */}
          <div className="pt-4 border-t border-gray-800/80 flex flex-wrap gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>GSTIN: <strong className="text-gray-200 font-mono">{profile.gstin}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PAN: <strong className="text-gray-200 font-mono">{profile.pan}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Ahmedabad PIN: <strong className="text-gray-200 font-mono">{profile.pincode}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-4">
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
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
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
              Mobile / WhatsApp: <a href={`https://wa.me/${profile.whatsapp}`} className="text-white hover:underline font-mono font-bold">{profile.mobile}</a>
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
