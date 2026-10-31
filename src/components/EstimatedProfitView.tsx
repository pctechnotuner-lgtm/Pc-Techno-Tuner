import React, { useMemo, useState } from 'react';
import { Invoice, Product } from '../types';
import { TrendingUp, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface Props {
  invoices: Invoice[];
  products: Product[];
}

export const EstimatedProfitView: React.FC<Props> = ({ invoices, products }) => {
  const [search, setSearch] = useState('');
  const [expandedParty, setExpandedParty] = useState<string | null>(null);

  const partyRows = useMemo(() => {
    const groups = new Map<string, { name: string; mobile: string; invoices: Invoice[]; sales: number; cost: number; discount: number; missing: number }>();
    invoices.forEach((invoice) => {
      const key = (invoice.customerMobile || invoice.customerName).toLowerCase();
      const row = groups.get(key) || { name: invoice.customerName, mobile: invoice.customerMobile, invoices: [], sales: 0, cost: 0, discount: 0, missing: 0 };
      row.invoices.push(invoice);
      row.sales += invoice.subtotal || 0;
      row.discount += invoice.discount || 0;
      invoice.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) row.cost += (product.purchasePrice || 0) * (Number(item.quantity) || 0);
        else row.missing += 1;
      });
      groups.set(key, row);
    });
    return Array.from(groups.values()).map((row) => ({ ...row, profit: row.sales - row.discount - row.cost }))
      .sort((x, y) => y.profit - x.profit);
  }, [invoices, products]);

  const filtered = partyRows.filter((row) => (row.name + ' ' + row.mobile).toLowerCase().includes(search.toLowerCase()));
  const totalSales = partyRows.reduce((sum, row) => sum + row.sales - row.discount, 0);
  const totalCost = partyRows.reduce((sum, row) => sum + row.cost, 0);
  const totalProfit = totalSales - totalCost;
  const money = (value: number) => '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5 text-white">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400"><TrendingUp className="w-6 h-6" /></div>
        <div><h1 className="text-xl font-bold">Estimated Profit — Party Wise</h1><p className="text-xs text-gray-400">Customer-wise profit calculated from invoice sales and saved stock purchase prices</p></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4"><p className="text-xs text-gray-400">Sales Value (before GST)</p><p className="text-xl font-bold">{money(totalSales)}</p></div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4"><p className="text-xs text-gray-400">Purchase Cost</p><p className="text-xl font-bold">{money(totalCost)}</p></div>
        <div className="bg-gray-900 border border-emerald-800 rounded-xl p-4"><p className="text-xs text-emerald-400">Estimated Profit</p><p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{money(totalProfit)}</p></div>
      </div>
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer / mobile number..." className="bg-transparent outline-none w-full text-sm text-white" />
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-800">
          <span className="col-span-4">Party / Customer</span><span className="col-span-2 text-right">Invoices</span><span className="col-span-2 text-right">Sale</span><span className="col-span-2 text-right">Cost</span><span className="col-span-2 text-right">Profit</span>
        </div>
        {filtered.length === 0 ? <p className="p-6 text-center text-sm text-gray-400">No invoice / party data found yet.</p> : filtered.map((row) => {
          const key = (row.mobile || row.name).toLowerCase();
          const open = expandedParty === key;
          return <div key={key} className="border-b border-gray-800 last:border-0">
            <button onClick={() => setExpandedParty(open ? null : key)} className="w-full grid grid-cols-12 gap-2 px-4 py-3 text-left items-center hover:bg-gray-800/60">
              <span className="col-span-4 min-w-0"><span className="block text-sm font-semibold truncate">{row.name}</span><span className="block text-[10px] text-gray-400">{row.mobile}</span></span>
              <span className="col-span-2 text-right text-sm">{row.invoices.length}</span>
              <span className="col-span-2 text-right text-xs">{money(row.sales - row.discount)}</span>
              <span className="col-span-2 text-right text-xs">{money(row.cost)}</span>
              <span className={`col-span-2 text-right text-xs font-bold ${row.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{money(row.profit)} {open ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />}</span>
            </button>
            {open && <div className="px-4 pb-3 space-y-2 bg-gray-950/60">
              {row.invoices.map((inv) => {
                const cost = inv.items.reduce((sum, item) => { const product = products.find((p) => p.id === item.productId); return sum + (product ? product.purchasePrice * (Number(item.quantity) || 0) : 0); }, 0);
                const missing = inv.items.filter((item) => !products.some((p) => p.id === item.productId)).length;
                const profit = (inv.subtotal || 0) - (inv.discount || 0) - cost;
                return <div key={inv.id} className="flex flex-wrap justify-between gap-2 border-t border-gray-800 pt-2 text-xs">
                  <div><span className="font-semibold">{inv.invoiceNo}</span><span className="text-gray-400 ml-2">{inv.invoiceDate}</span><span className="block text-[10px] text-gray-500">{missing ? missing + ' item(s) missing linked purchase cost' : 'All item costs linked'}</span></div>
                  <div className="text-right"><span className="block text-gray-300">Sale {money((inv.subtotal || 0) - (inv.discount || 0))}</span><span className={profit >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>Profit {money(profit)}</span></div>
                </div>;
              })}
              <p className="text-[10px] text-gray-500">Estimate only: GST excluded, invoice discount deducted, other expenses not included. Missing/unlinked product costs may make profit incomplete.</p>
            </div>}
          </div>;
        })}
      </div>
      <p className="text-[10px] text-gray-500">Profit is estimated using current saved Product/Stock purchase prices. If a product's purchase price is changed later, historical estimates may also change.</p>
    </div>
  );
};
