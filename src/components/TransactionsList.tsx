import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Share2, 
  Trash2, 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  User, 
  Coins, 
  Receipt,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Invoice, JewelerStoreProfile } from '../types';
import { formatGrams, formatINR } from '../utils/calculator';

interface TransactionsListProps {
  transactions: Invoice[];
  profile: JewelerStoreProfile;
  onViewInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onOpenTaxModal: () => void;
  onShareWhatsApp: (invoice: Invoice) => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  profile,
  onViewInvoice,
  onDeleteInvoice,
  onOpenTaxModal,
  onShareWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [metalFilter, setMetalFilter] = useState<'all' | 'gold' | 'silver'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'pending'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer.phone.includes(searchTerm) ||
        t.items.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesMetal =
        metalFilter === 'all' ||
        t.items.some((i) => (metalFilter === 'gold' ? i.metal === 'gold' : i.metal === 'silver'));

      const matchesStatus = statusFilter === 'all' || t.payment.status === statusFilter;

      return matchesSearch && matchesMetal && matchesStatus;
    });
  }, [transactions, searchTerm, metalFilter, statusFilter]);

  // Reset to page 1 whenever filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, metalFilter, statusFilter]);

  // Calculate pagination slices
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const paginatedTransactions = filtered.slice(startIndex, endIndex);

  // Aggregated figures
  const totalRevenue = filtered.reduce((s, t) => s + t.finalTotal, 0);
  const totalGoldGrams = filtered.reduce(
    (s, t) => s + t.items.filter((i) => i.metal === 'gold').reduce((is, i) => is + i.netWeightGrams, 0),
    0
  );
  const totalSilverGrams = filtered.reduce(
    (s, t) => s + t.items.filter((i) => i.metal === 'silver').reduce((is, i) => is + i.netWeightGrams, 0),
    0
  );
  const totalGstCollected = filtered.reduce((s, t) => s + t.totalGst, 0);
  const totalUdharBalance = filtered.reduce((s, t) => {
    if (t.payment.status === 'partial' || t.payment.status === 'pending') {
      return s + (t.payment.balanceAmount ?? (t.payment.status === 'pending' ? t.finalTotal : 0));
    }
    return s;
  }, 0);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-6">
      {/* Top Banner & Summary Cards */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <h2 className="text-base font-bold font-cinzel text-stone-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-600" />
            <span>Transaction Logs & Past Bills ({filtered.length})</span>
          </h2>
          <p className="text-xs text-stone-500">
            Persistent local record with cloud sync status, Udhar ledger, and CA export capability
          </p>
        </div>

        <button
          onClick={onOpenTaxModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export CA Tax Report (JSON / CSV)</span>
        </button>
      </div>

      {/* Summary Stat Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
          <span className="text-[10px] uppercase font-bold text-stone-500 block">Total Revenue</span>
          <span className="text-lg font-bold font-mono-num text-amber-900">{formatINR(totalRevenue)}</span>
        </div>

        <div className="bg-stone-50 p-3.5 rounded-xl border border-rose-200 bg-rose-50/40">
          <span className="text-[10px] uppercase font-bold text-rose-600 block">Pending Udhar</span>
          <span className="text-lg font-bold font-mono-num text-rose-700">{formatINR(totalUdharBalance)}</span>
        </div>

        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
          <span className="text-[10px] uppercase font-bold text-stone-500 block">Gold Sold</span>
          <span className="text-lg font-bold font-mono-num text-stone-900">{formatGrams(totalGoldGrams)}</span>
        </div>

        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
          <span className="text-[10px] uppercase font-bold text-stone-500 block">Silver Sold</span>
          <span className="text-lg font-bold font-mono-num text-stone-900">{formatGrams(totalSilverGrams)}</span>
        </div>

        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
          <span className="text-[10px] uppercase font-bold text-stone-500 block">GST Collected</span>
          <span className="text-lg font-bold font-mono-num text-emerald-800">{formatINR(totalGstCollected)}</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, bill number, or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={metalFilter}
            onChange={(e) => setMetalFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold bg-white border border-stone-300 rounded-xl text-stone-700"
          >
            <option value="all">All Metals</option>
            <option value="gold">Gold Only</option>
            <option value="silver">Silver Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold bg-white border border-stone-300 rounded-xl text-stone-700"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending (Udhar)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center border border-stone-200 rounded-xl space-y-1">
          <p className="text-xs font-semibold text-stone-600">No transactions match your search criteria.</p>
          <p className="text-[11px] text-stone-400">Try changing your search term or metal filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/80 text-stone-700 font-semibold border-b border-stone-200">
                <th className="p-3">Bill Number</th>
                <th className="p-3">Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items & Metal</th>
                <th className="p-3 text-right">Net Wt</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">Payment</th>
                <th className="p-3 text-center">Cloud Sync</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-mono-num">
              {paginatedTransactions.map((tx) => {
                const totalWeight = tx.items.reduce((s, i) => s + i.netWeightGrams, 0);
                return (
                  <tr key={tx.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-3 font-bold text-stone-900">{tx.invoiceNumber}</td>
                    <td className="p-3 text-stone-600">{tx.date}</td>
                    <td className="p-3 font-sans">
                      <div className="font-semibold text-stone-900">{tx.customer.name}</div>
                      <div className="text-[10px] text-stone-500 font-mono-num">{tx.customer.phone}</div>
                    </td>
                    <td className="p-3 font-sans">
                      <div className="truncate max-w-[180px] text-stone-800 font-medium">
                        {tx.items.map((i) => i.name).join(', ')}
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono-num">
                        {tx.items.map((i) => `${i.purityKarat}`).join(' • ')}
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold text-amber-900">
                      {formatGrams(totalWeight)}
                    </td>
                    <td className="p-3 text-right font-extrabold text-stone-900 text-sm">
                      {formatINR(tx.finalTotal)}
                    </td>
                    <td className="p-3 text-center font-sans">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm border ${
                          tx.payment.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : tx.payment.status === 'partial'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {tx.payment.status === 'pending' ? 'UDHAR / CREDIT' : tx.payment.status === 'partial' ? 'PARTIAL ADVANCE' : 'PAID'}
                      </span>
                      {tx.payment.status !== 'paid' && (
                        <div className="mt-1">
                          <span className="text-[11px] font-bold text-rose-700 block font-mono-num">
                            Pending: {formatINR(tx.payment.balanceAmount || tx.finalTotal)}
                          </span>
                          {tx.payment.dueDate && (
                            <span className="text-[10px] text-stone-500 block">
                              Due: {tx.payment.dueDate}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold font-sans">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Synced</span>
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewInvoice(tx)}
                          className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="View & Print Bill"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onShareWhatsApp(tx)}
                          className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Reshare Bill on WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to void/delete invoice ${tx.invoiceNumber}?`)) {
                              onDeleteInvoice(tx.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Void / Delete Bill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
          <div className="flex items-center gap-3 text-xs text-stone-600">
            <span>
              Showing <strong className="font-mono-num text-stone-900">{filtered.length === 0 ? 0 : startIndex + 1}</strong> to{' '}
              <strong className="font-mono-num text-stone-900">{endIndex}</strong> of{' '}
              <strong className="font-mono-num text-stone-900">{filtered.length}</strong> transactions
            </span>
            <div className="flex items-center gap-1.5 pl-3 border-l border-stone-200">
              <span className="text-[11px] text-stone-500">Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-xs font-semibold bg-white border border-stone-300 rounded-lg text-stone-800"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number indicators */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter((p) => {
                  if (totalPages <= 5) return true;
                  if (p === 1 || p === totalPages) return true;
                  return Math.abs(p - validCurrentPage) <= 1;
                })
                .map((pageNumber, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const showEllipsis = prevPage && pageNumber - prevPage > 1;

                  return (
                    <React.Fragment key={pageNumber}>
                      {showEllipsis && <span className="px-1 text-stone-400 text-xs">…</span>}
                      <button
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`min-w-[28px] h-7 px-2 text-xs font-semibold font-mono-num rounded-lg transition-colors cursor-pointer ${
                          validCurrentPage === pageNumber
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
