import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  Printer,
  Info,
  Package,
  Clock,
  Layers,
} from 'lucide-react';
import { Invoice, Language, Product, Transaction } from '../types';
import { getT } from '../i18n';

interface ReportsViewProps {
  invoices: Invoice[];
  transactions: Transaction[];
  products: Product[];
  lang: Language;
  onExportCsv: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  invoices,
  transactions,
  products,
  lang,
  onExportCsv,
}) => {
  const t = getT(lang);

  // Group transactions by date for Daily breakdown
  const dailyMap: { [date: string]: { income: number; expense: number } } = {};
  transactions.forEach((tx) => {
    if (!dailyMap[tx.date]) {
      dailyMap[tx.date] = { income: 0, expense: 0 };
    }
    if (tx.type === 'INCOME') dailyMap[tx.date].income += tx.amount;
    if (tx.type === 'EXPENSE') dailyMap[tx.date].expense += tx.amount;
  });

  const dailyRecords = Object.keys(dailyMap)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map((date) => ({
      date,
      income: dailyMap[date].income,
      expense: dailyMap[date].expense,
      net: dailyMap[date].income - dailyMap[date].expense,
    }));

  // Group transactions by Month (YYYY-MM)
  const monthlyMap: { [month: string]: { income: number; expense: number } } = {};
  transactions.forEach((tx) => {
    const month = tx.date.substring(0, 7);
    if (!monthlyMap[month]) {
      monthlyMap[month] = { income: 0, expense: 0 };
    }
    if (tx.type === 'INCOME') monthlyMap[month].income += tx.amount;
    if (tx.type === 'EXPENSE') monthlyMap[month].expense += tx.amount;
  });

  const monthlyRecords = Object.keys(monthlyMap)
    .sort((a, b) => b.localeCompare(a))
    .map((month) => ({
      month,
      income: monthlyMap[month].income,
      expense: monthlyMap[month].expense,
      net: monthlyMap[month].income - monthlyMap[month].expense,
    }));

  // Total customer payments received from invoices
  const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalReceived = invoices.reduce((s, i) => s + i.amountPaid, 0);
  const totalOutstanding = invoices.reduce((s, i) => s + i.balanceDue, 0);

  // Total Cash inflow from accounting
  const totalCashIn = transactions
    .filter((tx) => tx.type === 'INCOME')
    .reduce((s, tx) => s + tx.amount, 0);

  const totalCashOut = transactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((s, tx) => s + tx.amount, 0);

  // Net Cash flow (Cash basis)
  const netCashFlow = totalCashIn - totalCashOut;

  // Inventory Asset Value
  const inventoryCost = products.reduce(
    (s, p) => s + p.stockQuantity * p.purchasePrice,
    0
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <span>Business Cash Flow & Sales Summary</span>
          </h1>
          <p className="text-xs text-gray-400">
            Daily/monthly cash movement, invoice collections and customer dues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Financials</span>
          </button>
        </div>
      </div>

      {/* Accounting Clarification Note */}
      <div className="bg-blue-950/40 border border-blue-800/60 rounded-2xl p-4 text-xs text-gray-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Important: Cash Flow is not Net Profit</p>
          <p className="text-gray-400 leading-relaxed text-[11px]">
            This report currently summarizes recorded cash income and expenses, invoice totals, payments received and customer dues. It does not calculate accounting net profit, GST liability, stock cost of goods sold or unpaid supplier bills. Use it as an operational cash summary, not as a tax or statutory financial statement.
          </p>
        </div>
      </div>

      {/* Primary Financial Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Total Sales Invoiced</span>
          <p className="text-xl font-black text-white font-mono">
            ₹{totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-gray-500">Gross billing generated</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Payments Collected</span>
          <p className="text-xl font-black text-emerald-400 font-mono">
            ₹{totalReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-gray-500">Collected from clients</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Customer Outstanding Dues</span>
          <p className="text-xl font-black text-rose-400 font-mono">
            ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-gray-500">Accounts receivable</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Net Operating Cash Margin</span>
          <p className={`text-xl font-black font-mono ${netCashFlow >= 0 ? 'text-white' : 'text-rose-400'}`}>
            ₹{netCashFlow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-gray-500">Cash In minus Cash Out</span>
        </div>
      </div>

      {/* Monthly & Daily Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Monthly Cash Income & Expenses</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase border-b border-gray-800 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Income</th>
                  <th className="py-2.5 px-3">Expenses</th>
                  <th className="py-2.5 px-3 text-right">Net Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {monthlyRecords.map((m) => (
                  <tr key={m.month} className="hover:bg-gray-800/40 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">{m.month}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono">₹{m.income.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-rose-400 font-mono">₹{m.expense.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right">
                      <span className={m.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {m.net >= 0 ? '+' : ''}₹{m.net.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Daily Cashbook Logs</span>
          </h3>

          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase border-b border-gray-800 font-bold sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">In</th>
                  <th className="py-2.5 px-3">Out</th>
                  <th className="py-2.5 px-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {dailyRecords.map((d) => (
                  <tr key={d.date} className="hover:bg-gray-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-gray-400">{d.date}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono">₹{d.income.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-rose-400 font-mono">₹{d.expense.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right">
                      <span className={d.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {d.net >= 0 ? '+' : ''}₹{d.net.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
