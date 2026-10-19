import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Download,
  ShieldCheck,
  PlusCircle,
  MinusCircle,
  X,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { Language, Product, ProductCategory, PRODUCT_CATEGORIES } from '../types';
import { getT } from '../i18n';

interface ProductsAdminViewProps {
  products: Product[];
  lang: Language;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onExportCsv: () => void;
  onQuickUpdateStock: (productId: string, delta: number) => void;
}

export const ProductsAdminView: React.FC<ProductsAdminViewProps> = ({
  products,
  lang,
  onSaveProduct,
  onDeleteProduct,
  onExportCsv,
  onQuickUpdateStock,
}) => {
  const t = getT(lang);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Edit / Add Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Desktop Computers');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(0);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(1);
  const [formMinStock, setFormMinStock] = useState<number>(2);
  const [formWarranty, setFormWarranty] = useState<number>(12);
  const [formImage, setFormImage] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Desktop Computers');
    setFormBrand('');
    setFormModel('');
    setFormSpecs('');
    setFormPurchasePrice(0);
    setFormSellingPrice(0);
    setFormStock(1);
    setFormMinStock(2);
    setFormWarranty(12);
    setFormImage('');
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormBrand(p.brand);
    setFormModel(p.model);
    setFormSpecs(p.specifications);
    setFormPurchasePrice(p.purchasePrice);
    setFormSellingPrice(p.sellingPrice);
    setFormStock(p.stockQuantity);
    setFormMinStock(p.minStockAlert);
    setFormWarranty(p.warrantyMonths);
    setFormImage(p.imageUrl);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formSellingPrice <= 0) {
      alert('Please enter valid product name and selling price');
      return;
    }

    const updatedProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      brand: formBrand.trim(),
      model: formModel.trim(),
      specifications: formSpecs.trim(),
      purchasePrice: Number(formPurchasePrice) || 0,
      sellingPrice: Number(formSellingPrice) || 0,
      stockQuantity: Number(formStock) || 0,
      minStockAlert: Number(formMinStock) || 2,
      warrantyMonths: Number(formWarranty) || 12,
      imageUrl: formImage.trim() || 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&h=450&fit=crop',
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    onSaveProduct(updatedProduct);
    setModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesLowStock = !showLowStockOnly || p.stockQuantity <= p.minStockAlert;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.model.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesLowStock && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-500" />
            <span>Product Inventory Management</span>
          </h1>
          <p className="text-xs text-gray-400">
            Control 11 product categories, private cost prices, and minimum stock alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Export</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, brand, model..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Categories ({products.length})</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              showLowStockOnly
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-gray-950 text-gray-400 border border-gray-800 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Alerts Only</span>
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950 text-gray-400 uppercase font-bold border-b border-gray-800 tracking-wider">
              <tr>
                <th className="py-3 px-4">Item & Model</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Purchase Cost (Private)</th>
                <th className="py-3 px-4">Selling Price (GST Incl.)</th>
                <th className="py-3 px-4">Margin</th>
                <th className="py-3 px-4">In Stock</th>
                <th className="py-3 px-4">Warranty</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredProducts.map((p) => {
                const margin = p.sellingPrice - p.purchasePrice;
                const isLow = p.stockQuantity <= p.minStockAlert;
                return (
                  <tr key={p.id} className="hover:bg-gray-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-gray-950 border border-gray-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{p.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {p.brand} • <span className="font-mono">{p.model}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-gray-300">
                      <span className="px-2 py-0.5 rounded bg-gray-950 text-[10px] border border-gray-800">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-gray-400">
                      ₹{p.purchasePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-white">
                      ₹{p.sellingPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">
                      +₹{margin.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onQuickUpdateStock(p.id, -1)}
                          className="p-1 hover:text-white text-gray-400 disabled:opacity-30"
                          disabled={p.stockQuantity <= 0}
                          title="Reduce stock by 1"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                            isLow
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-gray-800 text-gray-200'
                          }`}
                        >
                          {p.stockQuantity}
                        </span>
                        <button
                          onClick={() => onQuickUpdateStock(p.id, 1)}
                          className="p-1 hover:text-white text-gray-400"
                          title="Increase stock by 1"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-gray-400">
                      {p.warrantyMonths} Months
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-blue-400 transition"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${p.name}?`)) onDeleteProduct(p.id);
                        }}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-rose-950 text-rose-400 transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 my-8 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                <span>{editingProduct ? 'Edit Product' : 'Add New Hardware Product'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Product Title / Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Intel Core i5 12th Gen Custom Office PC"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Product Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Brand</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. HP / Lenovo / CP PLUS"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Model Name / Number</label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="e.g. M126nw / ThinkPad E14"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Warranty (Months)</label>
                  <input
                    type="number"
                    min={0}
                    value={formWarranty}
                    onChange={(e) => setFormWarranty(Number(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-950 p-3 rounded-xl border border-gray-800">
                <div>
                  <label className="block text-rose-400 mb-1 font-semibold">
                    Purchase Cost (Private/Internal) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={formPurchasePrice}
                    onChange={(e) => setFormPurchasePrice(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-gray-500">Hidden from customer catalog</span>
                </div>

                <div>
                  <label className="block text-emerald-400 mb-1 font-semibold">
                    Selling Price (Incl. GST) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-gray-500">Public customer offer price</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Stock Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">
                    Min. Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Product Image URL</label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Technical Specifications</label>
                <textarea
                  rows={3}
                  value={formSpecs}
                  onChange={(e) => setFormSpecs(e.target.value)}
                  placeholder="CPU, RAM, Storage, Ports, Power Supply, OS details..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Product</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
